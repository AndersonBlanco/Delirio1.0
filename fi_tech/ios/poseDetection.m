#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#import <VisionCamera/VisionCameraProxyHolder.h> //had to change from VisionCameraProxy to VisionCameraProxyHolder -> VisionCameraProxyHolder is what's being used, in this file, anyways and not VisionCameraProxyHolder

#import <VisionCamera/Frame.h>
#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <Vision/Vision.h>
#import <CoreML/CoreML.h>
#import <Foundation/Foundation.h>
#import <dispatch/dispatch.h>
#import "punchClassification_coreml.h"
#import "GRUsmd.h"
#import <math.h>
#import "TTS.h"


double getAngle(NSArray *jointTrio, BOOL normalize){ // get angle method
  
  if (jointTrio == nil || jointTrio.count != 3) {
        return 0.0;
    }
    
    NSDictionary *p1 = jointTrio[0];
    NSDictionary *p2 = jointTrio[1]; // vertex point
    NSDictionary *p3 = jointTrio[2];
    
    if (!p1 || !p2 || !p3) {
        return 0.0;
    }
    
    double x1 = fabs([p1[@"x"] doubleValue]);
    double y1 = fabs([p1[@"y"] doubleValue]);
    double x2 = fabs([p2[@"x"] doubleValue]);
    double y2 = fabs([p2[@"y"] doubleValue]);
    double x3 = fabs([p3[@"x"] doubleValue]);
    double y3 = fabs([p3[@"y"] doubleValue]);
    
  double angle1 = atan2(y1 - y2, x1 - x2);
     double angle2 = atan2(y3 - y2, x3 - x2);
     
     // Calculate the difference between the angles in radians.
     double rads = angle2 - angle1;
     
     // Convert the radian difference to degrees.
     double angle = fabs((rads) * (180/M_PI));
     
     // Adjust the angle if it's greater than 180 degrees.
     if (angle > 180) {
         return 360 - angle;
     } else {
         return angle;
     }
};

int getLabel(MLMultiArray *pred){
  int maxConfidenceIndex_in_pred = 0;
  
  for(int i = 0; i < 8; i++){
    if([pred[maxConfidenceIndex_in_pred] doubleValue] < [pred[i] doubleValue]){
      maxConfidenceIndex_in_pred = i;
    }
  }
  
 
  return maxConfidenceIndex_in_pred;
}

int getPunchTypeMaxConfIdx(MLMultiArray *prediction){
  int max_conf_idx = 0;
  for(int i = 0; i < 4; i++){
    if([prediction[max_conf_idx] doubleValue] < [prediction[max_conf_idx] doubleValue]){
      max_conf_idx = i;
    }
  };
  return max_conf_idx;
}

@interface poseDetectionPlugin : FrameProcessorPlugin{
  int count;
  bool reached40;
  BOOL nilValuefound;
  MLMultiArray *angles_40frame;
  //GRUsmd *model;
  punchClassification_coreml *punchClassificationModel;
  NSArray *labelArray;
  NSArray *punchClassArray;
  BOOL moveWindowIsOpen;
  NSTimeInterval lastSampleTimestamp;
  NSTimeInterval sampleInterval;
  TTS *tts;
  int maxConf_idx;
  int punchClassify_max_conf_idx;
}
@end


@implementation poseDetectionPlugin
- (instancetype _Nonnull)initWithProxy:(VisionCameraProxyHolder*)proxy
                           withOptions:(NSDictionary* _Nullable)options {
  self = [super initWithProxy:proxy withOptions:options];
  NSError *_error;

   if(self){
     count = 0;
     reached40 = false;
     nilValuefound = NO;
    angles_40frame = [[MLMultiArray alloc] initWithShape:@[@1, @40, @8] dataType:MLMultiArrayDataTypeDouble error:&_error];
   // model = [[GRUsmd alloc] init];
     punchClassificationModel = [[punchClassification_coreml alloc] init];
    self->moveWindowIsOpen = YES;
     self->lastSampleTimestamp = -1.0;
     self->sampleInterval = (40/30)/10; // e.g. sample at 30 fps
     self->tts = [[TTS alloc] init];
     self->maxConf_idx = -1;
     self->punchClassify_max_conf_idx = -1;
     labelArray = @[
       @"good jab",
       @"bad jab - knee level lack",
       
       @"good straight",
       @"bad straight, lack of rotation",
       
       @"good rest",
       @"bad rest, wrong stance",
       
       @"good kick",
       @"bad kick, don't lounge leg out"];
     punchClassArray = @[
       @"jab",
       @"straightRight",
       @"upperCut",
       @"hook",
       @"rest"
     ];
     
     //initiate audio session:
     AVAudioSession *session = [AVAudioSession sharedInstance];
     
     NSLog(@"Output route: %@", [[AVAudioSession sharedInstance] currentRoute]);
     
     NSError *audioSessionError = nil;

     BOOL success = [session setCategory:AVAudioSessionCategoryPlayback
                             withOptions:AVAudioSessionCategoryOptionMixWithOthers
                                   error:&audioSessionError];

     if (!success) {
       NSLog(@"Failed to set audio session category: %@", audioSessionError.localizedDescription);
     }

     success = [session setActive:YES error:&audioSessionError];
     if (!success) {
       NSLog(@"Failed to activate audio session: %@", audioSessionError.localizedDescription);
     }
     
  }
  if (_error) {
             NSLog(@"Error initializing MLMultiArray: %@", _error.localizedDescription);
         } else {
             // Initialize all values to 0
             for (int frame = 0; frame < 40; frame++) {
                 for (int angle = 0; angle < 8; angle++) {
                     [angles_40frame setObject:@0.0 forKeyedSubscript:@[@0, @(frame), @(angle)]];
                 }
             }
         }
  return self;
}


- (id _Nullable)callback:(Frame* _Nonnull)frame
           withArguments:(NSDictionary* _Nullable)arguments {

  
  BOOL userStrikedOut = NO;
  if(arguments[@"userStrikedOut"] != nil){
    userStrikedOut = [arguments[@"userStrikedOut"] boolValue];
  };
  
  /*
  if(self->maxConf_idx > 0){
    if(userStrikedOut){
      [tts speak: labelArray[maxConf_idx]];
    }
  }
  */
  

  NSError *error;
 
  
  //incirment count - used to keep track of number of frames passed, and set threshold for custom GRU model call once count == 40:
  
 


  
  
  NSMutableArray *jointNames = [NSMutableArray array];

  CMSampleBufferRef buffer = frame.buffer;
  //time component execution to handle consistent frame prediction and extract per desired time elapse
  CMTime timestamp = CMSampleBufferGetPresentationTimeStamp(buffer);
  NSTimeInterval currentTimeSec = CMTimeGetSeconds(timestamp);
  
  if (self->lastSampleTimestamp < 0) {
    self->lastSampleTimestamp = currentTimeSec;
  }
  
 // UIImageOrientation orientation = frame.orientation;
  // code goes here
  /**
  //native based drawing test:----------------
  CVImageBufferRef *imgBuffer = CMSampleBufferGetImageBuffer(buffer);
  CVPixelBufferLockBaseAddress(imgBuffer, 0);
  OSType pixelFormat = CVPixelBufferGetPixelFormatType(imgBuffer);
  size_t width = CVPixelBufferGetWidth(imgBuffer);
  size_t height = CVPixelBufferGetHeight(imgBuffer);
  size_t bytesPerRow = CVPixelBufferGetBytesPerRow(imgBuffer);
  void *baseAddress = CVPixelBufferGetBaseAddress(imgBuffer);
  
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  
  CGContextRef ctxRef = CGBitmapContextCreate(baseAddress, width, height, 8, bytesPerRow, colorSpace, kCGImageAlphaPremultipliedFirst |  kCGBitmapByteOrder32Little);
  
  //drawing section : START:
  CGContextSetFillColorWithColor(ctxRef, [[UIColor redColor] CGColor]);
  CGContextFillRect(ctxRef, CGRectMake(50,25,100, 100));
  //drawing section : END
  
  
  //release the altered color-space and cotext:
  CGColorSpaceRelease(colorSpace);
  CGContextRelease(ctxRef);
  CVPixelBufferUnlockBaseAddress(imgBuffer, 0);
  //--------------------------------------
  */
  
  
  //setting up VNHumanBodyPoseDetection class from Vision framework
  VNImageRequestHandler *requestHandler = [[VNImageRequestHandler alloc] initWithCMSampleBuffer:buffer options:@{
   // VNImageOptionOrientation: @(orientation)
  }];

  
  VNDetectHumanBodyPoseRequest *request = [[VNDetectHumanBodyPoseRequest alloc] init];
  

  BOOL success = [requestHandler performRequests:@[request] error:&error];

   if (!success) {
     NSLog(@"Human body pose detection failed: %@", error.localizedDescription);
     return nil; // Or handle the error appropriately
   }
//  NSMutableDictionary *joints = [NSMutableDictionary dictionary];
 

  NSMutableArray *poses = [NSMutableArray array];
  
  for(VNRecognizedObjectObservation *observation in request.results){
    //lock buffer address here
    
    if ([observation isKindOfClass:[VNHumanBodyPoseObservation class]]) {
      VNHumanBodyPoseObservation *poseObserv = (VNHumanBodyPoseObservation*)observation;
      NSMutableDictionary *joints = [NSMutableDictionary dictionary];

      
      NSArray<VNHumanBodyPoseObservationJointName> *allJoints= [poseObserv availableJointNames];
      
      for(VNHumanBodyPoseObservationJointName j in allJoints){
        
        [jointNames addObject: j];
        NSError *jError = nil;
        VNRecognizedPoint *recognPoint = [poseObserv recognizedPointForJointName:j error:&jError];
        if(recognPoint != nil && recognPoint.confidence>0.0){
        
          CGPoint normPoint = CGPointMake(recognPoint.location.x, 1.0 -  recognPoint.location.y); //was mirrored with 1.0 - recognPoint.location.y
          if(recognPoint == nil){
            nilValuefound = YES;
          }else{
            nilValuefound = NO;
          }
          joints[j] = @{
            @"name": j,
            @"x": @(normPoint.x),
            @"y": @(normPoint.y),
            @"conf": @(recognPoint.confidence)
            
          }; //end of obj to be added to joints array
        }
      
      }
      
      [poses addObject:[joints copy]];
      /*
      VNHumanBodyPose3DPoint *rightAnkle = [poseObservation recognizedPointForJointName:VNHumanBodyPoseObservationJointNameRightAnkle error:nil];
           if (rightAnkle) {
             joints[VNHumanBodyPoseObservationJointNameRightAnkle] = @{
               @"x": @(rightAnkle.location.x),
               @"y": @(rightAnkle.location.y),
               @"confidence": @(rightAnkle.confidence)
             };
           }
       */
      
    }
    //unlock buffer address here.
  }
  
  //const allJoints = ["right_upLeg_joint", "right_forearm_joint", "left_leg_joint", "left_hand_joint", "left_ear_joint", "left_forearm_joint", "right_leg_joint", "right_foot_joint", "right_shoulder_1_joint", "neck_1_joint", "left_upLeg_joint", "left_foot_joint", "root", "right_hand_joint", "left_eye_joint", "head_joint", "right_eye_joint", "right_ear_joint", "left_shoulder_1_joint"] -------------> utilize to extarct index_TO_joinName from array joints[index] = {name: ..., x: .., y: ..}

  
  //Final class return section:
  
  //return nil;
  //NSArray *finalRes = @[jointNames, poses];
  
  //rightElbowAngle - test :
  
  
 // NSMutableArray *temp = [[NSMutableArray alloc] init];
  /*
  for(int x = 0; x < 40; x++){
    NSMutableArray *arr = [[NSMutableArray alloc] init];
    for(int y = 0; y < 8; y++){
      [arr addObject:angles_40frame[@[@0, @(x), @(y)]]];
    }
    [temp addObject:arr];
  }
*/
  
  if(!moveWindowIsOpen || userStrikedOut){
    return @[
      @(count),
      poses,
    @[],
       @"Wait for break to end",// predictions, could also be any other string
      @0, //max confidence index | returns 0 when unavailable
      @(moveWindowIsOpen) //if this is false, then the string above likey is true, else, string above ,ight not fit context of situation
    ];
  }
  
  
  
  
  
  NSDictionary *latestJoints = [poses lastObject];
  
  if( latestJoints[@"left_shoulder_1_joint"] != nil && latestJoints[@"left_forearm_joint"] != nil && latestJoints[@"left_hand_joint"] != nil && latestJoints[@"left_upLeg_joint"] != nil && latestJoints[@"left_leg_joint"] != nil && latestJoints[@"left_foot_joint"] != nil && latestJoints[@"right_shoulder_1_joint"] != nil && latestJoints[@"right_forearm_joint"] != nil && latestJoints[@"right_hand_joint"] != nil && latestJoints[@"right_upLeg_joint"] != nil && latestJoints[@"right_leg_joint"] != nil && latestJoints[@"right_foot_joint"] != nil){
    
    double RightElbowAngle = getAngle(@[latestJoints[@"left_shoulder_1_joint"], latestJoints[@"left_forearm_joint"], latestJoints[@"left_hand_joint"]], NO);
    
    double LeftElbowAngle = getAngle(@[latestJoints[@"right_shoulder_1_joint"], latestJoints[@"right_forearm_joint"], latestJoints[@"right_hand_joint"]], YES);
    
    double RightShoulderAngle = getAngle(@[latestJoints[@"left_upLeg_joint"], latestJoints[@"left_shoulder_1_joint"], latestJoints[@"left_forearm_joint"]], NO);
    
    double LeftShoulderAngle = getAngle(@[latestJoints[@"right_upLeg_joint"], latestJoints[@"right_shoulder_1_joint"], latestJoints[@"right_forearm_joint"]], YES);
    
    double RightHipAngle = getAngle(@[latestJoints[@"left_shoulder_1_joint"], latestJoints[@"left_upLeg_joint"], latestJoints[@"left_leg_joint"]], NO);
    
    double LeftHipAngle = getAngle(@[latestJoints[@"right_shoulder_1_joint"], latestJoints[@"right_upLeg_joint"], latestJoints[@"right_leg_joint"]], YES);

    double RightKneeAngle = getAngle(@[latestJoints[@"left_upLeg_joint"], latestJoints[@"left_leg_joint"], latestJoints[@"left_foot_joint"]], NO);
    
    double LeftKneeAngle = getAngle(@[latestJoints[@"right_upLeg_joint"], latestJoints[@"right_leg_joint"], latestJoints[@"right_foot_joint"]], YES);
    
    
    
    
    /*
    
   if(testRightElbowAngle >= 90){
      
      return @[jointNames, poses, @true, @"90"];
    }
     */
    

    
    NSArray *anglesOfInterest = @[
      @(RightElbowAngle),
      @(RightShoulderAngle),
      @(RightHipAngle),
      @(RightKneeAngle),
      @(LeftElbowAngle),
      @(LeftShoulderAngle),
      @(LeftHipAngle),
      @(LeftKneeAngle),

  
    ];
    
    
    
   
    
    
    //[angles_40frame setObject: anglesOfInterest forKeyedSubscript:@[@1, @(count)]];
    //angles_40frame[count] = anglesOfInterest;
    //custom GRU model load:
    //GRUsmd *model = [[GRUsmd alloc] init];
    //VNCoreMLModel *_m = [VNCoreMLModel modelForMLModel:model error:nil];
   
    
    
    /*
    VNCoreMLRequest *model_request = [[VNCoreMLRequest alloc] initWithModel:_m completionHandler:(VNRequestCompletionHandler)^(VNRequest *model_request, NSError *error){
      //model prediction execution
      NSArray *res= [request.results copy];
      return res;
      
    }];
    
    */
    //model prediction:
    
    if (currentTimeSec - lastSampleTimestamp >= sampleInterval) { //if true, one frame elpased here
      lastSampleTimestamp = currentTimeSec;
      double *angles_40frame_dataPointer = (double *)angles_40frame.dataPointer;
      
      for (int i = 0; i < anglesOfInterest.count; i++) {
        double angleValue = [anglesOfInterest[i] doubleValue];
        //was:
        /*
         
         */
        //NSLog((angleValue));
        //below, flat index is used: batch * (maxFrames * maxAnglesWithinEachFrame) + currentFrames*maxAnglesWithinEachFrame + currentAngle
        angles_40frame_dataPointer[count * 8 + i] = (isnan(angleValue) || isinf(angleValue)) ? 0.0 : angleValue;
      }
      
  
      count++; //incriment count after each subsequent frame
    }
    

    if(count >= 40){ //dont wait until count == 40, count = 0 also appends a angle_extract_from_frame array to the angles_40_frame array
    
      //set moveWindowIsOpen to false since now the frame cap ha sbeen reached, so the minor break for / to improve GRU model preformance must initiate
      self->moveWindowIsOpen = NO;
      //[tts speak:self->labelArray[self->maxConf_idx]];
      
     //automatic start timer
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
          self->moveWindowIsOpen = YES;
          self->count = 0;
        self->lastSampleTimestamp =-1.0;
      });
      
      //GRUsmdOutput *model_output = [model predictionFromInput_3:angles_40frame error:&error];
      
      punchClassification_coremlOutput *punchClassificationOutput = [punchClassificationModel predictionFromInput_1:angles_40frame error:&error];
    
      NSMutableArray *temp = [[NSMutableArray alloc] init];
      //GRUsmdInput *model_input = [[GRUsmdInput alloc] initWithInput_3:angles_40frame];
   
      
      for(int x = 0; x < angles_40frame.count; x++){
        NSNumber *set = angles_40frame[x];
       // for(int y = 0; y < 8; y++){
          [temp addObject:set];
      //  }
      }
      
      //generate valid array with valid data type to pass to JS thread
      NSMutableArray *angleFramesArray = [NSMutableArray arrayWithCapacity:40];
      double *ptr = (double *)angles_40frame.dataPointer;

      for (int frame = 0; frame < 40; frame++) {
        NSMutableArray *frameAngles = [NSMutableArray arrayWithCapacity:8];
        for (int angle = 0; angle < 8; angle++) {
          double value = ptr[frame * 8 + angle];
          [frameAngles addObject:@(value)];
        }
        [angleFramesArray addObject:frameAngles];
      }
      
      
      //self->maxConf_idx = getLabel(model_output.Identity);
      self->punchClassify_max_conf_idx = getPunchTypeMaxConfIdx(punchClassificationOutput.Identity);
      /*
      NSMutableArray *confidenceValues = [NSMutableArray arrayWithCapacity:model_output.Identity.count];
      for (int i = 0; i < model_output.Identity.count; i++) {
        [confidenceValues addObject:model_output.Identity[i]];
      }
       */
      //count = 0;
// temp,//raw prediciotn hot-encoding array
      

      return @[
        @(count),
        poses,
        @[
          @[@(RightElbowAngle), @(LeftElbowAngle)],
          @[@(RightShoulderAngle), @(LeftShoulderAngle)],
          @[@(RightHipAngle), @(LeftHipAngle)],
          @[@(RightKneeAngle), @(LeftKneeAngle)]
        ],
        //labelArray[maxConf_idx], //predictions,
        @0,
        @(maxConf_idx),
        @(moveWindowIsOpen),
        punchClassArray[punchClassify_max_conf_idx],
        angleFramesArray
      ];
    }else{
      
      return @[
       @(count), //was: jointNames,
        poses,
       @[
         @[@(RightElbowAngle), @(LeftElbowAngle)],
         @[@(RightShoulderAngle), @(LeftShoulderAngle)],
         @[@(RightHipAngle), @(LeftHipAngle)],
         @[@(RightKneeAngle), @(LeftKneeAngle)]
       ],
       @"Wait for break to be over", //no predicitons available yet,
       @-1, //max confiddence Index  | returns 0 when unavailable
       @(moveWindowIsOpen),
       @"Wait for break to be over, punchClass" //no predictions for punch classififxation available yet
      ];
    }
    
  }

    return @[
      @(count),
      poses,
    @[],
      @"Get into camera view",// predictions
      @-1, //max confidence index  | returns 0 when unavailable
      @(moveWindowIsOpen),
      @-1 //max confidence for punch classification model
    ];
  

 
}

VISION_EXPORT_FRAME_PROCESSOR(poseDetectionPlugin, detect)

@end

#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#import <VisionCamera/VisionCameraProxyHolder.h> //had to change from VisionCameraProxy to VisionCameraProxyHolder -> VisionCameraProxyHolder is what's being used, in this file, anyways and not VisionCameraProxyHolder

#import <VisionCamera/Frame.h>
#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <Vision/Vision.h>
#import <CoreML/CoreML.h>
#import <Foundation/Foundation.h>
#import "GRUsmd.h"
#import <math.h>

double getAngle(NSArray *jointTrio){ // get angle method
  
  if (jointTrio == nil || jointTrio.count != 3) {
        return 0.0;
    }
    
    NSDictionary *p1 = jointTrio[0];
    NSDictionary *p2 = jointTrio[1]; // vertex point
    NSDictionary *p3 = jointTrio[2];
    
    if (!p1 || !p2 || !p3) {
        return 0.0;
    }
    
    double x1 = [p1[@"x"] doubleValue];
    double y1 = [p1[@"y"] doubleValue];
    double x2 = [p2[@"x"] doubleValue];
    double y2 = [p2[@"y"] doubleValue];
    double x3 = [p3[@"x"] doubleValue];
    double y3 = [p3[@"y"] doubleValue];
    
    // Calculate vectors from vertex to other points
    double v1x = x1 - x2;
    double v1y = y1 - y2;
    double v2x = x3 - x2;
    double v2y = y3 - y2;
    
    // Calculate magnitudes
    double mag1 = sqrt(v1x * v1x + v1y * v1y);
    double mag2 = sqrt(v2x * v2x + v2y * v2y);
    
    if (mag1 == 0 || mag2 == 0) {
        return 0.0;
    }
    
    // Calculate dot product and angle
    double dotProduct = v1x * v2x + v1y * v2y;
    double cosAngle = dotProduct / (mag1 * mag2);
    
    // Clamp to avoid numerical errors
    cosAngle = fmax(-1.0, fmin(1.0, cosAngle));
    
  return acos(cosAngle) * (180.0 / M_PI)/180; 
};

NSString* getLabel(MLMultiArray *pred){
  int maxConfidenceIndex_in_pred = 1;
  NSArray *labelArray = @[@"good jab", @"bad jab - knee level lack",
                         @"good straight", @"bad straight, lack of rotation",@"good rest", @"bad rest, wrong stance",
                          @"good kick", @"bad kick, don't lounge leg out"];
  
  for(int i = 0; i < 8; i++){
    if([pred[maxConfidenceIndex_in_pred] doubleValue] < [pred[i] doubleValue]){
      maxConfidenceIndex_in_pred = i;
    }
  }
  
  return labelArray[maxConfidenceIndex_in_pred];
}

@interface poseDetectionPlugin : FrameProcessorPlugin{
  int count;
  bool reached40;
  BOOL nilValuefound;
  MLMultiArray *angles_40frame;
  GRUsmd *model;
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
     
    model = [[GRUsmd alloc] init];
  }
  return self;
}


- (id _Nullable)callback:(Frame* _Nonnull)frame
           withArguments:(NSDictionary* _Nullable)arguments {
  
  NSError *error;
 
  
  //incirment count - used to keep track of number of frames passed, and set threshold for custom GRU model call once count == 40:
  
 


  
  
  NSMutableArray *jointNames = [NSMutableArray array];

  CMSampleBufferRef buffer = frame.buffer;
  UIImageOrientation orientation = frame.orientation;
  // code goes here
  
  //setting up VNHumanBodyPoseDetection class from Vision framework
  VNImageRequestHandler *requestHandler = [[VNImageRequestHandler alloc] initWithCMSampleBuffer:buffer options:@{}];

  
  VNDetectHumanBodyPoseRequest *request = [[VNDetectHumanBodyPoseRequest alloc] init];
  

  BOOL success = [requestHandler performRequests:@[request] error:&error];

   if (!success) {
     NSLog(@"Human body pose detection failed: %@", error.localizedDescription);
     return nil; // Or handle the error appropriately
   }
  NSMutableDictionary *joints = [NSMutableDictionary dictionary];
 

  NSMutableArray *poses = [NSMutableArray array];
  
  for(VNRecognizedObjectObservation *observation in request.results){
    if ([observation isKindOfClass:[VNHumanBodyPoseObservation class]]) {
      VNHumanBodyPoseObservation *poseObserv = (VNHumanBodyPoseObservation*)observation;
   
      NSArray<VNHumanBodyPoseObservationJointName> *allJoints= [poseObserv availableJointNames];
      
      for(VNHumanBodyPoseObservationJointName j in allJoints){
        [jointNames addObject: j];
        NSError *jError = nil;
        VNRecognizedPoint *recognPoint = [poseObserv recognizedPointForJointName:j error:&jError];
        if(recognPoint != nil && recognPoint.confidence>0.0){
        
          CGPoint normPoint = CGPointMake(recognPoint.location.x, 1.0 - recognPoint.location.y);
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
      
      [poses addObject:joints];
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
  if(joints[@"left_shoulder_1_joint"] != nil && joints[@"left_forearm_joint"] != nil && joints[@"left_hand_joint"] != nil && joints[@"left_upLeg_joint"] != nil && joints[@"left_leg_joint"] != nil && joints[@"left_foot_joint"] != nil && joints[@"right_shoulder_1_joint"] != nil && joints[@"right_forearm_joint"] != nil && joints[@"right_hand_joint"] != nil && joints[@"right_upLeg_joint"] != nil && joints[@"right_leg_joint"] != nil && joints[@"right_foot_joint"] != nil){
    
    double RightElbowAngle = getAngle(@[joints[@"left_shoulder_1_joint"], joints[@"left_forearm_joint"], joints[@"left_hand_joint"]]);
    
    double LeftElbowAngle = getAngle(@[joints[@"right_shoulder_1_joint"], joints[@"right_forearm_joint"], joints[@"right_hand_joint"]]);
    
    double RightShoulderAngle = getAngle(@[joints[@"left_upLeg_joint"], joints[@"left_shoulder_1_joint"], joints[@"left_forearm_joint"]]);
    
    double LeftShoulderAngle = getAngle(@[joints[@"right_upLeg_joint"], joints[@"right_shoulder_1_joint"], joints[@"right_forearm_joint"]]);
    
    double RightHipAngle = getAngle(@[joints[@"left_shoulder_1_joint"], joints[@"left_upLeg_joint"], joints[@"left_leg_joint"]]);
    
    double LeftHipAngle = getAngle(@[joints[@"right_shoulder_1_joint"], joints[@"right_upLeg_joint"], joints[@"right_leg_joint"]]);

    double RightKneeAngle = getAngle(@[joints[@"left_upLeg_joint"], joints[@"left_leg_joint"], joints[@"left_foot_joint"]]);
    
    double LeftKneeAngle = getAngle(@[joints[@"right_upLeg_joint"], joints[@"right_leg_joint"], joints[@"right_foot_joint"]]);
    
    
    
    
    /*
    
   if(testRightElbowAngle >= 90){
      
      return @[jointNames, poses, @true, @"90"];
    }
     */
    

    
    NSArray *anglesOfInterest = @[
      @(LeftElbowAngle),
      @(LeftShoulderAngle),
      @(LeftHipAngle),
      @(LeftKneeAngle),
      @(RightElbowAngle),
      @(RightShoulderAngle),
      @(RightHipAngle),
      @(RightKneeAngle)
  
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
    
    for(int i = 0; i < anglesOfInterest.count; i++){
      if(isnan([anglesOfInterest[i] doubleValue])){
        [angles_40frame setObject:@0.0 forKeyedSubscript:@[@0, @(count), @(i)]];
      }else{
        [angles_40frame setObject:anglesOfInterest[i] forKeyedSubscript:@[@0, @(count), @(i)]];

      }
    };
    
    count++; //incriment count after each subsequent frame
    
    

    if(count == 39){ //dont wait until count == 40, count = 0 also appends a angle_extract_from_frame array to the angles_40_frame array
      

    
      NSMutableArray *temp = [[NSMutableArray alloc] init];
      GRUsmdInput *model_input = [[GRUsmdInput alloc] initWithInput_3:angles_40frame];
      GRUsmdOutput *model_output = [model predictionFromInput_3:angles_40frame error:&error];
      
      for(int x = 0; x < model_output.Identity.count; x++){
        [temp addObject:model_output.Identity[x]];
      }
      NSString *label = getLabel(model_output.Identity);
     
      /*
      NSMutableArray *confidenceValues = [NSMutableArray arrayWithCapacity:model_output.Identity.count];
      for (int i = 0; i < model_output.Identity.count; i++) {
        [confidenceValues addObject:model_output.Identity[i]];
      }
       */
      count = 0;

      
      return @[
        @(count),
        poses,
        @[
          @[@(RightElbowAngle), @(LeftElbowAngle)],
          @[@(RightShoulderAngle), @(LeftShoulderAngle)],
          @[@(RightHipAngle), @(LeftHipAngle)],
          @[@(RightKneeAngle), @(LeftKneeAngle)]
        ],
        label, //predictions,
        temp //montioring size
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
       @-1, //no predicitons available yet,
       @-1
      ];
    }
    
  };
  
    return @[
      @(count),
      poses,
    @[],
      @"Get into camera view",// predictions
      @-1
    ];
  

 
}

VISION_EXPORT_FRAME_PROCESSOR(poseDetectionPlugin, detect)

@end

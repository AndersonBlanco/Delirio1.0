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

  NSDictionary *p1 = jointTrio[0];
  NSDictionary *p2 = jointTrio[1];// point of interest, which is located at the point of angle of interest
  NSDictionary *p3 = jointTrio[2];
  
  double a = sqrt( pow( ( [p1[@"x"] doubleValue] - [p2[@"x"] doubleValue]),2) + pow( ( [p1[@"y"] doubleValue] - [p2[@"y"] doubleValue]),2));
  
  double b = sqrt( pow( ( [p3[@"x"] doubleValue] - [p2[@"x"] doubleValue]),2) + pow( ( [p3[@"y"] doubleValue] - [p2[@"y"] doubleValue]),2));
  
  double c = sqrt( pow( ( [p3[@"x"] doubleValue] - [p1[@"x"] doubleValue]),2) + pow( ( [p3[@"y"] doubleValue] - [p1[@"y"] doubleValue]),2));
  
  if(a == 0 || b == 0){
    return 0;
  }
  return acos((pow(c,2) - pow(a,2) - pow(b, 2))/(-2*a*b)) *(180/M_PI);
};

NSString* getLabel(MLMultiArray *pred){
  int maxConfidenceIndex_in_pred = 0;
  NSArray *labelArray = @[@"good jab", @"bad jab - knee level lack",
                         @"good straight", @"bad straight, lack of rotation",@"good rest", @"bad rest, wrong stance",
                          @"good kick", @"bad kick, don't lounge leg out"];
  
  for(int i = 0; i < 8; i++){
    if(pred[maxConfidenceIndex_in_pred] < pred[i]){
      maxConfidenceIndex_in_pred = i;
    }
  }
  
  return labelArray[maxConfidenceIndex_in_pred];
}

@interface poseDetectionPlugin : FrameProcessorPlugin
@end

int count = 0;
bool reached40 = false;
BOOL nilValuefound = NO;

@implementation poseDetectionPlugin

- (instancetype _Nonnull)initWithProxy:(VisionCameraProxyHolder*)proxy
                           withOptions:(NSDictionary* _Nullable)options {
  self = [super initWithProxy:proxy withOptions:options];
  if(self){

  }
  return self;
}




- (id _Nullable)callback:(Frame* _Nonnull)frame
           withArguments:(NSDictionary* _Nullable)arguments {
  
  NSError *error;
  NSError *_error = nil;
  MLMultiArray *angles_40frame = [[MLMultiArray alloc] initWithShape:@[@1, @40, @8] dataType:MLMultiArrayDataTypeDouble error:&_error];
  
  //incirment count - used to keep track of number of frames passed, and set threshold for custom GRU model call once count == 40:
  
  if(count == 40){
    reached40 = true;
  }
  


  
  
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

  NSMutableArray *poseResults = [NSMutableArray array];
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
        
       
          [poses addObject:joints];
        
        
      }
      
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
      @(RightElbowAngle), @(LeftElbowAngle),
      @(RightShoulderAngle), @(LeftShoulderAngle),
      @(RightHipAngle), @(LeftHipAngle),
      @(RightKneeAngle), @(LeftKneeAngle)
    ];
    
    
    
       for(int i = 0; i < anglesOfInterest.count; i++){
         [angles_40frame setObject:anglesOfInterest[i] forKeyedSubscript:@[@0,@(count), @(i)]];
       }
     
    
    
    //[angles_40frame setObject: anglesOfInterest forKeyedSubscript:@[@1, @(count)]];
    //angles_40frame[count] = anglesOfInterest;
    count++; //incriment count after each subsequent frame
    
    
    //custom GRU model load:
    GRUsmd *model = [[GRUsmd alloc] init];
    //VNCoreMLModel *_m = [VNCoreMLModel modelForMLModel:model error:nil];
   
    
    
    /*
    VNCoreMLRequest *model_request = [[VNCoreMLRequest alloc] initWithModel:_m completionHandler:(VNRequestCompletionHandler)^(VNRequest *model_request, NSError *error){
      //model prediction execution
      NSArray *res= [request.results copy];
      return res;
      
    }];
    
    */
    //model prediction:
    
    
    
    if(count == 40){ //dont wait until count == 40, count = 0 also appends a angle_extract_from_frame array to the angles_40_frame array
      GRUsmdInput *model_input = [[GRUsmdInput alloc] initWithInput_3:angles_40frame];
      GRUsmdOutput *model_output = [model predictionFromInput_3:angles_40frame error:&error];
      
      NSString *label = getLabel(model_output.Identity);
      
      count = 0;
  
      return @[
        jointNames,
        poses,
        @[
          @[@(RightElbowAngle), @(LeftElbowAngle)],
          @[@(RightShoulderAngle), @(LeftShoulderAngle)],
          @[@(RightHipAngle), @(LeftHipAngle)],
          @[@(RightKneeAngle), @(LeftKneeAngle)]
        ],
        label //predictions
      ];
    }else{
      return @[
        jointNames,
        poses,
      @[],
        @(count) // predictions
      ];
    }
    
  };
  
    return @[
      jointNames,
      poses,
    @[],
      @"Get into camera view" // predictions
    ];
  

 
}

VISION_EXPORT_FRAME_PROCESSOR(poseDetectionPlugin, detect)

@end

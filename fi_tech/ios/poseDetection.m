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
//#import "punchClassification_coreml.h"
//#import "punchClassification_coreml3.h"
#import "punchClassification_coreml4.h"
//#import "GRUsmd.h"
#import <math.h>

//#import "MediaPipeTasksVision/MPPPoseLandmarker.h" // Import MediaPipe Header
#import <CoreMedia/CoreMedia.h>
#import <CoreVideo/CoreVideo.h>
#import <Accelerate/Accelerate.h>
#import "CHAINED_MODEL_coreml.h"
#import "GRU12.h"
 
//GRU12 is bets version yet


/*
//gray scale buffer concerter: START
CMSampleBufferRef createGrayscaleCMSampleBuffer(CMSampleBufferRef sourceSampleBuffer) {
    if (!sourceSampleBuffer) {
        return NULL;
    }

    // 1. Extract CVPixelBufferRef from the source CMSampleBufferRef
    CVImageBufferRef sourceImageBuffer = CMSampleBufferGetImageBuffer(sourceSampleBuffer);
    if (!sourceImageBuffer) {
        NSLog(@"Error: Could not get image buffer from source sample buffer.");
        return NULL;
    }

    CVPixelBufferRef sourcePixelBuffer = (CVPixelBufferRef)sourceImageBuffer; // CVImageBufferRef is typedef for CVPixelBufferRef
    
    // Get image dimensions
    size_t width = CVPixelBufferGetWidth(sourcePixelBuffer);
    size_t height = CVPixelBufferGetHeight(sourcePixelBuffer);

    // Lock the base address of the source pixel buffer
    CVPixelBufferLockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly);

    // Get information about the source pixel buffer
    void *sourceBaseAddress = CVPixelBufferGetBaseAddress(sourcePixelBuffer);
    size_t sourceBytesPerRow = CVPixelBufferGetBytesPerRow(sourcePixelBuffer);
    OSType sourcePixelFormat = CVPixelBufferGetPixelFormatType(sourcePixelBuffer);

    // Ensure the source format is 32BGRA for this example.
    // Handle other formats or convert first if your camera outputs different types.
    if (sourcePixelFormat != kCVPixelFormatType_32BGRA) {
        NSLog(@"Error: Unsupported pixel format. This function expects kCVPixelFormatType_32BGRA, but got %d.", (int)sourcePixelFormat);
        CVPixelBufferUnlockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly);
        return NULL;
    }

    // Create a vImage_Buffer from the source CVPixelBuffer
    vImage_Buffer sourceBuffer = {
        .data = sourceBaseAddress,
        .height = height,
        .width = width,
        .rowBytes = sourceBytesPerRow
    };

    // Create a new CVPixelBuffer for the grayscale output
    CVPixelBufferRef grayPixelBuffer = nil;
    CVReturn cvRet = CVPixelBufferCreate(kCFAllocatorDefault,
                                        width,
                                        height,
                                         kCVPixelFormatType_8Indexed, // Grayscale format
                                        nil, // Optional pixel buffer attributes
                                        &grayPixelBuffer);

    if (cvRet != kCVReturnSuccess) {
        NSLog(@"Error creating grayscale pixel buffer: %d", cvRet);
        CVPixelBufferUnlockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly);
        return NULL;
    }

    // Lock the base address of the grayscale pixel buffer
    CVPixelBufferLockBaseAddress(grayPixelBuffer, 0);
    void *grayBaseAddress = CVPixelBufferGetBaseAddress(grayPixelBuffer);
    size_t grayBytesPerRow = CVPixelBufferGetBytesPerRow(grayPixelBuffer);

    // Create a vImage_Buffer for the grayscale destination
    vImage_Buffer destBuffer = {
        .data = grayBaseAddress,
        .height = height,
        .width = width,
        .rowBytes = grayBytesPerRow
    };

    // Grayscale conversion using vImageMatrixMultiply_ARGB8888
    // Weights for luminance (standard NTSC values)
    const int16_t matrix[] = {
        (int16_t)(0.114 * 256), // Blue channel weight (BGRA -> B)
        (int16_t)(0.587 * 256), // Green channel weight (BGRA -> G)
        (int16_t)(0.299 * 256), // Red channel weight (BGRA -> R)
        0                      // Alpha channel (ignored for grayscale)
    };
    int32_t divisor = 256; // To normalize the output values (sum of weights is 1)

    vImage_Error vImageError = vImageMatrixMultiply_ARGB8888(&sourceBuffer,
                                                              &destBuffer,
                                                              matrix,
                                                              divisor,
                                                              NULL, // Background color (not needed for grayscale)
                                                              NULL, // Flags (not used here)
                                                              kvImageNoFlags);

    if (vImageError != kvImageNoError) {
        NSLog(@"vImage grayscale conversion error: %zd", vImageError);
        CVPixelBufferUnlockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly);
        CVPixelBufferUnlockBaseAddress(grayPixelBuffer, 0);
        CVPixelBufferRelease(grayPixelBuffer); // Release the partially created buffer
        return NULL;
    }

    // Unlock the base addresses
    CVPixelBufferUnlockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly);
    CVPixelBufferUnlockBaseAddress(grayPixelBuffer, 0);

    // --- Now, create a new CMSampleBufferRef from the grayscale CVPixelBufferRef ---
    
    // Get timing and format information from the source sample buffer
    CMVideoFormatDescriptionRef sourceFormatDescription = CMSampleBufferGetFormatDescription(sourceSampleBuffer);
    CMSampleTimingInfo sourceTimingInfo = kCMTimingInfoInvalid;
    CMSampleBufferGetSampleTimingInfo(sourceSampleBuffer, 0, &sourceTimingInfo); // Get timing info

    // Create a new format description for the grayscale pixel buffer
    CMVideoFormatDescriptionRef grayFormatDescription = nil;
    CMVideoFormatDescriptionCreateForImageBuffer(kCFAllocatorDefault, grayPixelBuffer, &grayFormatDescription);
    
    if (!grayFormatDescription) {
        NSLog(@"Error creating grayscale format description.");
        CVPixelBufferRelease(grayPixelBuffer);
        return NULL;
    }

    CMSampleBufferRef grayscaleSampleBuffer = nil;
    OSStatus status = CMSampleBufferCreateReadyWithImageBuffer(kCFAllocatorDefault,
                                                               grayPixelBuffer,
                                                               grayFormatDescription, // Use the new grayscale format description
                                                               &sourceTimingInfo,     // Use timing info from source
                                                               &grayscaleSampleBuffer);

    // Release the format descriptions
    CFRelease(grayFormatDescription);
    
    // Release the pixel buffer as the sample buffer now holds a reference to it
    // IMPORTANT: It's crucial to release grayPixelBuffer here to prevent a memory leak
    CVPixelBufferRelease(grayPixelBuffer);

    if (status != noErr) {
        NSLog(@"Error creating CMSampleBuffer: %d", (int)status);
        if (grayscaleSampleBuffer) {
            CFRelease(grayscaleSampleBuffer);
        }
        return NULL;
    }

    return grayscaleSampleBuffer;
}

//gray scale buffer converter: END .
*/

double getAngle(NSArray *jointTrio, BOOL random) {
    if (jointTrio == nil || jointTrio.count != 3) {
        return 0.0;
    }

    NSDictionary *a = jointTrio[0]; // Point A
    NSDictionary *b = jointTrio[1]; // Vertex B
    NSDictionary *c = jointTrio[2]; // Point C

    if (!a || !b || !c) {
        return 0.0;
    }

    double ax = [a[@"x"] doubleValue];
    double ay = [a[@"y"] doubleValue];
    double bx = [b[@"x"] doubleValue];
    double by = [b[@"y"] doubleValue];
    double cx = [c[@"x"] doubleValue];
    double cy = [c[@"y"] doubleValue];

    // Vectors AB and CB
    double abx = bx - ax;
    double aby = by - ay;
    double cbx = bx - cx;
    double cby = by - cy;

    // Dot product
    double dot = abx * cbx + aby * cby;

    // Magnitudes
    double abMag = sqrt(abx * abx + aby * aby);
    double cbMag = sqrt(cbx * cbx + cby * cby);

    // Avoid division by zero
    double denominator = fmax(abMag * cbMag, 1e-5);
    double cosTheta = dot / denominator;

    // Clamp value to [-1, 1] to avoid NaN from acos
    cosTheta = fmax(-1.0, fmin(1.0, cosTheta));

    double angle = acos(cosTheta); // in radians
    return angle / ( M_PI); // Normalize between 0 and 1
}


int getLabel(MLMultiArray *pred, int max_len){
  int maxConfidenceIndex_in_pred = 0;
  
  for(int i = 0; i < max_len; i++){
    if([pred[maxConfidenceIndex_in_pred] doubleValue] < [pred[i] doubleValue]){
      maxConfidenceIndex_in_pred = i;
    }
  }
  
 
  return maxConfidenceIndex_in_pred;
}

int getPunchTypeMaxConfIdx(MLMultiArray *prediction){
  int max_conf_idx = 0;
  for(int i = 0; i < 3; i++){
    if([prediction[max_conf_idx] doubleValue] < [prediction[i] doubleValue]){
      max_conf_idx = i;
    }
  };
  return max_conf_idx;
}

int getCHAIEND_maxIdx(MLMultiArray *prediction){
  int max_conf_idx = 0;
  for(int i = 0; i < 6; i++){
    if([prediction[max_conf_idx] doubleValue] < [prediction[i] doubleValue]){
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
  GRU12 *model7;
  //punchClassification_coreml4 *punchClassificationModel;
  //CHAINED_MODEL_coreml *chained_model;
  NSArray *labelArray;
  NSArray *punchClassArray;
  NSArray *CHAINED_labelArray;
  BOOL moveWindowIsOpen;
  NSTimeInterval lastSampleTimestamp;
  NSTimeInterval sampleInterval;
 
  int maxConf_idx;
  int maxModel7Idx;
  int punchClassify_max_conf_idx;
  int chained_max_idx;
  
  NSMutableArray *set100_training;
  CIContext *contxt;
  //MLMultiArray *test_input;
  NSArray *labels7;
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
      //model = [[GRUsmd alloc] init];
     self->model7 = [[GRU12 alloc] init];
     //punchClassificationModel = [[punchClassification_coreml4 alloc] init];
    // self->chained_model = [[CHAINED_MODEL_coreml alloc] init];
    self->moveWindowIsOpen = YES;
     self->lastSampleTimestamp = -1.0;
     
     self->sampleInterval = 0.15; //was 40/30; //was (40/30)/10; // e.g. sample at 30 fps
 
     self->maxConf_idx = -1;
     self->punchClassify_max_conf_idx = -1;
     self->chained_max_idx = -1;
     self->set100_training = [[NSMutableArray alloc] init];
     self->labels7 = @[
       @"good jab",//0
       @"jab endguard",//1
       @"jab opposite guad",//2
       @"jab lowguard",//3
       @"good rest",//4
       @"rest curvedback",//5
       @"rest lowguard",//6
       @"good straight",//7
       @"straight oppositeguard",//8
       @"straight rotation",//9
       @"good uppercut",//10
       @"uppercut rotation",//11
       
       
       @"jab rotation",//12
       @"rest curvedback & lowguard"//13
     ];
     self->maxModel7Idx = -1;
     
     labelArray = @[
       @"good jab",
       @"bad jab - knee level lack",
       
       @"good straight",
       @"bad straight, lack of rotation",
       
       @"good rest",
       @"bad rest, wrong stance",
       
        @"good kick",//@"bad jab, dont punch down",
       @"bad kick, dont lounge leg out"]; //@"bad rest, straigthnen your back and up your guard"]; //  was bad kick
     punchClassArray = @[
       @"jab",
       @"straightRight",
       @"rest"
     ];
     CHAINED_labelArray = @[@"jab_lack_of_rotation", @"jab_correct", @"straight_right_lack_of_rotation", @"straight_right_correct", @"rest_bad_stance", @"rest_correct" ];
     
     //initiate audio session:
     AVAudioSession *session = [AVAudioSession sharedInstance];
     
    // NSLog(@"Output route: %@", [[AVAudioSession sharedInstance] currentRoute]);
     
     NSError *audioSessionError = nil;

     BOOL success = [session setCategory:AVAudioSessionCategoryPlayback
                             withOptions:AVAudioSessionCategoryOptionMixWithOthers
                                   error:&audioSessionError];
     //self->contxt= [CIContext contextWithOptions:nil];
     
     
     
     /*
     double test_angles_set_good_rest[40][8] = {
             {21,  4, 167, 158, 10,  8, 159, 177},
             {24,  2, 169, 158,  8,  8, 160, 177},
             {24,  2, 169, 158,  7,  8, 159, 177},
             {24,  1, 169, 158,  7,  8, 159, 177},
             {24,  2, 169, 158,  6,  8, 159, 177},
             {22,  1, 169, 158,  7,  8, 159, 176},
             {21,  2, 168, 158, 10,  8, 160, 176},
             {20,  2, 168, 158, 11,  8, 160, 177},
             {19,  1, 168, 158,  9,  9, 161, 177},
             {20,  0, 168, 158,  8, 10, 161, 177},
             {20,  0, 167, 158,  8, 11, 161, 176},
             {20,  1, 167, 158,  8, 11, 162, 177},
             {20,  0, 166, 158,  8, 11, 162, 176},
             {19,  1, 165, 157,  9, 16, 162, 176},
             {19,  1, 163, 155,  9, 17, 163, 176},
             {19,  1, 162, 154,  8, 20, 163, 176},
             {20,  1, 161, 152,  5, 20, 162, 176},
             {21,  2, 162, 151,  4, 20, 161, 175},
             {21,  2, 162, 150,  4, 19, 159, 173},
             {22,  3, 161, 148,  4, 16, 158, 173},
             {23,  4, 161, 148,  4, 13, 159, 173},
             {24,  5, 161, 148,  5, 13, 159, 173},
             {25,  5, 161, 148,  2, 15, 159, 173},
             {25,  5, 162, 149,  2, 16, 158, 172},
             {25,  5, 163, 150,  2, 16, 158, 172},
             {25,  5, 163, 150,  2, 16, 158, 172},
             {24,  5, 164, 153,  1, 17, 159, 171},
             {23,  3, 163, 153,  1, 18, 160, 172},
             {24,  3, 161, 152,  0, 18, 161, 172},
             {25,  3, 159, 151,  1, 21, 159, 170},
             {26,  4, 159, 151,  2, 22, 158, 170},
             {25,  4, 160, 153,  2, 22, 157, 169},
             {25,  5, 162, 154,  1, 21, 156, 169},
             {25,  5, 163, 154,  1, 20, 155, 168},
             {27,  6, 163, 156,  1, 16, 155, 167},
             {27,  6, 164, 157,  1, 16, 154, 167},
             {27,  6, 164, 157,  1, 17, 154, 167},
             {27,  6, 165, 158,  1, 18, 154, 167},
             {27,  6, 165, 158,  2, 18, 154, 167},
             {27,  6, 165, 158,  3, 18, 154, 167}
         };
    self->test_input = [[MLMultiArray alloc] initWithShape:@[@1, @40, @8]
                                                                dataType:MLMultiArrayDataTypeDouble
                                                            error:&_error];
     double *test_input_dataPointer = (double *)test_input.dataPointer;
        
        // Populate the test_input using data pointer
        for (int frame = 0; frame < 40; frame++) {
            for (int angle = 0; angle < 8; angle++) {
                NSInteger flatIndex = frame * 8 + angle;
                double testValue = test_angles_set_good_rest[frame][angle];
                test_input_dataPointer[flatIndex] = (isnan(testValue) || isinf(testValue)) ? 0.0 : testValue;
            }
        }
     
     
     */
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

  //CGFloat paddingPercentage = 0.1;

  // Calculate the new origin (x, y)
  // The left padding is 10%, so the x-coordinate starts at 0.1
  // The bottom padding is 10%, so the y-coordinate starts at 0.1
  //CGFloat originX = paddingPercentage; // 0.1
  //CGFloat originY = paddingPercentage; // 0.1

  // Calculate the new width and height
  // Each side has 10% padding, so the total width reduction is 20% (10% left + 10% right)
  // The width and height of the ROI will be 100% - 20% = 80%
 // CGFloat width = 1.0 - (2 * paddingPercentage); // 1.0 - 0.2 = 0.8
  //CGFloat height = 1.0 - (2 * paddingPercentage); // 1.0 - 0.2 = 0.8

  // Create the CGRect using normalized coordinates
 // CGRect regionOfInterest = CGRectMake(originX, originY, width, height);
  VNDetectHumanBodyPoseRequest *request = [[VNDetectHumanBodyPoseRequest alloc] init];
  //request.regionOfInterest =regionOfInterest;
  request.revision = VNDetectHumanBodyPoseRequestRevision1;
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
        if(recognPoint != nil && recognPoint.confidence>0.5){ //set confidence threshold to convinience | currently is 0.0 - may be very low and cause poor performance????
        
          CGPoint normPoint = CGPointMake(recognPoint.location.x, 1-recognPoint.location.y); //is mirrored with 1.0 - recognPoint.location.y
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
      @(self->maxConf_idx), //max confidence index | returns 0 when unavailable
      @(self->moveWindowIsOpen) //if this is false, then the string above likey is true, else, string above ,ight not fit context of situation
    ];
  }
  
  /*
   GRU12:
   data_paths = [
    ("jab_end_guard_left_guard", 0),
    ("jab_endguard", 1),
    ("jab_good", 2),
    ("jab_leftguard", 3),
    ("jab_rotation", 4),
    ("rest_good", 5),
    ("rest_hunchedback", 6),
    ("rest_low_guard_hunched_back", 7),
    ("rest_lowguard", 8),
    ("straight_good", 9),
    #("straight_rotation", 10),
    ("straight_left_guard", 10),
    ("uppercut_good", 11),
    ("uppercut_lackrotation", 12),
    #("uppercut_overcharge_overreach", 14),
    ]
   
   GRU12, GRU12:
   data_paths = [
       ("jab_end_guard_left_guard", 0),
       ("jab_endguard", 1),
       ("jab_good", 2),
       ("jab_leftguard", 3),
       ("jab_rotation", 4),
       ("rest_good", 5),
       ("rest_hunchedback", 6),
       ("rest_low_guard_hunched_back", 7),
       ("rest_lowguard", 8),
       ("straight_good", 9),
       ("straight_rotation", 10),
       ("straight_left_guard", 11),
       ("uppercut_good", 12),
       ("uppercut_lackrotation", 13),
       ("uppercut_overcharge_overreach", 14),
       ]
   
*/
  
  

  
  
  
  NSDictionary *latestJoints = [poses lastObject];
  
  if( latestJoints[@"left_shoulder_1_joint"] != nil && latestJoints[@"left_forearm_joint"] != nil && latestJoints[@"left_hand_joint"] != nil && latestJoints[@"left_upLeg_joint"] != nil && latestJoints[@"left_leg_joint"] != nil && latestJoints[@"left_foot_joint"] != nil && latestJoints[@"right_shoulder_1_joint"] != nil && latestJoints[@"right_forearm_joint"] != nil && latestJoints[@"right_hand_joint"] != nil && latestJoints[@"right_upLeg_joint"] != nil && latestJoints[@"right_leg_joint"] != nil && latestJoints[@"right_foot_joint"] != nil){
    
    double RightElbowAngle = getAngle(@[ latestJoints[@"left_shoulder_1_joint"], latestJoints[@"left_forearm_joint"], latestJoints[@"left_hand_joint"],], NO);
    
    double LeftElbowAngle = getAngle(@[  latestJoints[@"right_shoulder_1_joint"], latestJoints[@"right_forearm_joint"], latestJoints[@"right_hand_joint"]], YES);
    
    
    double RightShoulderAngle = getAngle(@[ latestJoints[@"left_forearm_joint"], latestJoints[@"left_shoulder_1_joint"], latestJoints[@"left_upLeg_joint"]], NO);
    
    double LeftShoulderAngle = getAngle(@[latestJoints[@"right_forearm_joint"],  latestJoints[@"right_shoulder_1_joint"], latestJoints[@"right_upLeg_joint"]], YES);
    
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
    
     
//frame flow control section: START///////////////////////////////////////////
    //if(currentTimeSec - lastSampleTimestamp >= sampleInterval) { //if true, one frame elpased here
      //lastSampleTimestamp = currentTimeSec;
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
   //}
//frame flow control section: END///////////////////////////////////////////


    if(count >= 39){ //dont wait until count == 40, count = 0 also appends a angle_extract_from_frame array to the angles_40_frame array
      
      //print angles_40frame:
 
      
    
      //set moveWindowIsOpen to false since now the frame cap ha sbeen reached, so the minor break for / to improve GRU model preformance must initiate
      self->moveWindowIsOpen = NO;
      //invoke sound cue here:
     
      
      //[tts speak:self->labelArray[self->maxConf_idx]];
      
     //automatic start timer
      __weak typeof(self) weakSelf = self;
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
          self->moveWindowIsOpen = YES;
          self->count = 0;
        self->lastSampleTimestamp =-1.0;
        
    
        
      });
      
      //GRUsmdInput *model_input = [[GRUsmdInput alloc] initWithInput_3:angles_40frame];
      //GRUsmdOutput *model_output = [model predictionFromFeatures:model_input error:&error];
      
      ///implementing GRU12: START####################/////////////////////////
      GRU12Input *model7_input = [[GRU12Input alloc] initWithInput_1:angles_40frame];
      GRU12Output *model7_output = [self->model7 predictionFromFeatures:model7_input error:&error];
      self->maxModel7Idx = getLabel(model7_output.Identity, model7_output.Identity.count);
      ///implementing GRU12: END####################/////////////////////////
      
      
      //punchClassification_coreml4Output *punchClassificationOutput = [punchClassificationModel predictionFromInput_1:angles_40frame error:&error];

      //CHAINED_MODEL_coremlOutput *chainedModelOutput = [chained_model predictionFromInput_2:test_input error:&error];
    
      /*
      NSMutableArray *temp = [[NSMutableArray alloc] init];
      for(int x = 0; x < model_output.Identity.count; x++){
       // NSNumber *val = chainedModelOutput.Identity[x];
       // for(int y = 0; y < 8; y++){
          [temp addObject:model_output.Identity[x]];
      //  }
      }
      */
      
      
      //generate valid array with valid data type to pass to JS thread
      NSMutableArray *angleFramesArray = [NSMutableArray arrayWithCapacity:40];
      double *ptr = (double *)angles_40frame.dataPointer;
     
      
    
      for (int frame = 0; frame < 40; frame++) {
        NSMutableArray *frameAngles = [NSMutableArray arrayWithCapacity:8];
        for (int angle = 0; angle < 8; angle++) {
          double value = ptr[frame * 8 + angle];
          [frameAngles addObject:@(value)];
        }
        [angleFramesArray addObject:[frameAngles copy]];
      }

      // Store the clean 40-frame array
      [set100_training addObject:[angleFramesArray copy]];
  
      [angleFramesArray removeAllObjects];
      
 
    
      //self->maxConf_idx = getLabel(model_output.Identity, 8);
  
      
      
      //self->punchClassify_max_conf_idx = getPunchTypeMaxConfIdx(punchClassificationOutput.Identity);
     // self->chained_max_idx = getCHAIEND_maxIdx(chainedModelOutput.Identity);
      /*
      NSMutableArray *confidenceValues = [NSMutableArray arrayWithCapacity:model_output.Identity.count];
      for (int i = 0; i < model_output.Identity.count; i++) {
        [confidenceValues addObject:model_output.Identity[i]];
      }
       */
      //count = 0;
// temp,//raw prediciotn hot-encoding array
      
      
     /* //handle live voice and text generation natively: START
      [
        tts
        prompt_gpt:@"Hello Universe"
        resolver:^(NSString * _Nullable result, NSError * _Nullable error) {
          
        }
      ];
      //handle live voice and text generation natively: END */
      
      

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
        @(-1),
        @(self->maxModel7Idx),//was @(chained_max_idx) //was @(punchClassify_max_conf_idx), //was maxConf_idx
        @(self->moveWindowIsOpen),
        labels7[self->maxModel7Idx], //was: labelArray[self->maxConf_idx],//was: punchClassArray[punchClassify_max_conf_idx],
        set100_training,
        labels7[self->maxModel7Idx]
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
       @(self->moveWindowIsOpen),
       @"Wait for break to be over, punchClass",
       set100_training //no predictions for punch classififxation available yet
      ];
    }
    
  }

    return @[
      @(count),
      poses,
    @[],
      @"Get into camera view",// predictions
      @-1, //max confidence index  | returns 0 when unavailable
      @(self->moveWindowIsOpen),
      @-1, //max confidence for punch classification model
      set100_training
    ];
  

 
}

VISION_EXPORT_FRAME_PROCESSOR(poseDetectionPlugin, detect)

@end


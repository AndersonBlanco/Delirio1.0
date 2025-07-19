
#import <React/RCTBridgeModule.h>
#import <AVFoundation/AVFoundation.h>
#import <Speech/Speech.h>

@interface TTS : NSObject <RCTBridgeModule>
@property (nonatomic, strong) AVPlayer *_Nonnull audioPlayer;
@property (nonatomic, strong) AVAudioEngine *_Nonnull audioEngine;
@property (nonatomic, strong) SFSpeechAudioBufferRecognitionRequest *recognitionRequest;
@property (nonatomic, strong) SFSpeechRecognitionTask *recognitionTask;
@property (nonatomic, strong) SFSpeechRecognizer *speechRecognizer;
-(void)speak:(nonnull NSString *)txt;
- (void) stopRecognitionSafely; 
- (void)prompt_gpt:(NSString *_Nullable)prompt
          resolver:(void (^ _Nonnull)(NSString * _Nullable result, NSError * _Nullable error))resolver;
@end

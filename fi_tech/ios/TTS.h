// TTSPlugin.h
#import <React/RCTBridgeModule.h>
#import <AVFoundation/AVFoundation.h>

@interface TTS : NSObject <RCTBridgeModule>
@property (nonatomic, strong) AVSpeechSynthesizer *synth;
-(void)speak:(NSString *)txt; 
@end

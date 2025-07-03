
#import "TTS.h"

@implementation TTS

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
    _synth = [[AVSpeechSynthesizer alloc] init];
  }
  return self;
}

RCT_EXPORT_METHOD(speak:(NSString *)text) {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self.synth.isSpeaking) {
      [self.synth stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    }

    AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:text];
    utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-US"];
    utterance.rate = 0.45;
    utterance.pitchMultiplier = 1.0;

    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayback
             withOptions:AVAudioSessionCategoryOptionMixWithOthers
                   error:nil];
    [session setActive:YES error:nil];

    [self.synth speakUtterance:utterance];
  });
}

@end

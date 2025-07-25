
#import "TTS.h"
#import <React/RCTLog.h>
#import <AVFoundation/AVFoundation.h>



@interface TTS()
@end

@implementation TTS{
  NSString *apiKey;
  float current_max_amplitude;
  int timerValue;
  NSTimer *timer_clock;
  NSString *transcribedText;
  float amplitude_sum;
  BOOL recording;
  NSString *recentInstructions;
}
RCT_EXPORT_MODULE();

- (instancetype) init{
  self->recentInstructions = @"";
  self->current_max_amplitude = 0.0f;
  self->amplitude_sum = 0.0f;
  self->transcribedText = @"";
  self->timerValue = 1.25;
  self->recording = NO;
  self->timer_clock = [NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(timeTick) userInfo:nil repeats:YES];
  self->apiKey = @"";
  if (self = [super init]) {
    _audioPlayer = [[AVPlayer alloc] init];
  }
  return self;
}



-(void)timeTick{
  //if(self->_recognitionTask)
  //self->amplitude_sum+=self->current_max_amplitude;
  NSError *err;
  //if(self->recording == YES){
    if(self->timerValue == 0){
      self->timerValue = 1.25;
      if(self->transcribedText.length > 0){
        
        //act upon transcribedText content
        NSLog(@"textTranscreibed: %@", self->transcribedText);

        [self stopRecognitionSafely];
        
        [self prompt_gpt:self->transcribedText additionalInstructions:self->recentInstructions resolve:^(NSString * _Nullable result, NSError * _Nullable err) {
          //prompt callback
            [self playOpenAIAudioFromText:result withCompletion:^{
            NSLog(@"transcribedText spoken");
          
              [self startMicCapture];
              
        
          }];
          
        }];
     
      }
    
      self->transcribedText = @"";
     
    }else{
      self->timerValue -= 1;
     // NSLog(@"Timer: %i", self->timerValue);
    }
  //}
  
  
  //NSLog(@"%@", @(timerValue));
  //NSLog(@"Max ampltiude: %f", current_max_amplitude);
}

//text input promt stream --> stream Agentic AI response (conversational): START


- (NSData *)extract_pcm_data_from_audio_buffer:(AVAudioPCMBuffer *)buffer {
    AVAudioFrameCount frameLength = buffer.frameLength;
    UInt32 channelCount = buffer.format.channelCount;
    float * const * floatData = buffer.floatChannelData;
  
    NSMutableData *pcmData = [NSMutableData dataWithCapacity:frameLength * sizeof(int16_t)];

    for (AVAudioFrameCount i = 0; i < frameLength; i++) {
        Float32 sampleSum = 0.0f;

        // Average across all channels
        for (UInt32 ch = 0; ch < channelCount; ch++) {
            sampleSum += floatData[ch][i];
        }
        Float32 avgSample = sampleSum / channelCount;

        // Clamp between -1.0 and 1.0
        avgSample = fmaxf(fminf(avgSample, 1.0f), -1.0f);

        // Convert to signed 16-bit int
        int16_t intSample = (int16_t)(avgSample * 32767.0f);

        [pcmData appendBytes:&intSample length:sizeof(int16_t)];
    }

    return pcmData;
}

- (void)stopRecognitionSafely {
  
  if (self.audioEngine.isRunning) {
    [self.audioEngine stop];
    [[self.audioEngine inputNode] removeTapOnBus:0];
  }


  if (self.recognitionRequest) {
    [self.recognitionRequest endAudio];
    self.recognitionRequest = nil;
  }

  if (self.recognitionTask) {
    [self.recognitionTask cancel];
    self.recognitionTask = nil;
  }
  
  NSLog(@"capture stoppped");
}

-(float) getMaxAudioBufferAmplitude:(AVAudioPCMBuffer *)buffer{
  AVAudioFrameCount frameLength = buffer.frameLength;
  UInt32 channelCount = buffer.format.channelCount;
  float maxAmplitude = 0.0f;
  float*const *floatData = buffer.floatChannelData;
  for(AVAudioChannelCount i = 0; i < frameLength; i++){
    for( UInt32 x = 0; x< channelCount; x++){
      float currentAmplitude = fabsf(floatData[x][i]);
      if(maxAmplitude < currentAmplitude){
        maxAmplitude = currentAmplitude;
      }
    }
  }
  
  return maxAmplitude;
  
}
-(void)startMicCapture{
  NSError *err = nil;

  //set recording = YES after whehn invoked
  self->recording = YES;
  
  
  AVAudioSession *audio_session = [AVAudioSession sharedInstance];
  [audio_session
   setCategory:AVAudioSessionCategoryPlayAndRecord
   withOptions:AVAudioSessionCategoryOptionDefaultToSpeaker
   error:&err];
  
  [audio_session setMode: AVAudioSessionModeVoiceChat error:&err];
  [audio_session setActive:YES withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation  error:&err];
  
  if(err){
    NSLog(@"audio_session error: %@", err.localizedDescription);
  }
  
  
  self.speechRecognizer = [[SFSpeechRecognizer alloc] initWithLocale:[NSLocale localeWithLocaleIdentifier:@"en-US"]];
   if (!self.speechRecognizer.isAvailable) {
     NSLog(@"Speech recognizer not available");
     return;
   }


  
   self.recognitionRequest = [[SFSpeechAudioBufferRecognitionRequest alloc] init];
   self.audioEngine = [[AVAudioEngine alloc] init];
   AVAudioInputNode *inputNode = self.audioEngine.inputNode;

  //if(self->timerValue <= 0 && self->current_max_amplitude >= 0.05f){
   
    self.recognitionTask = [self.speechRecognizer recognitionTaskWithRequest:self.recognitionRequest resultHandler:^(SFSpeechRecognitionResult * _Nullable result, NSError * _Nullable error) {
      if(result){
      
        
        NSString *transcrption = result.bestTranscription.formattedString;
        if(self->timerValue == 0){
         // self->recording = NO;
          //NSLog(@"Transcripiton: %@",transcrption);
       
        }else{
         NSLog(@"Contuing recording. Transccription befroe clearing: %@", self->transcribedText);
          self->timerValue = 1.25;
          self->transcribedText = transcrption;
         // self->recording = YES;


         // [self startMicCapture]; //start gaain since either self->transcribedText is empty or self->timerValue is
        }
         
         
        
        
        
        if (error || result.isFinal) {
          [self.audioEngine stop];
          [inputNode removeTapOnBus:0];
          self.recognitionRequest = nil;
          self.recognitionTask = nil;
        }
        
      }else{
        NSLog(@"not recording, no results");
      }
      
    } ];
    
    
  //}
  
  
  //live tap into mic:
  AVAudioFormat *recordingFormat = [inputNode outputFormatForBus:0];
   [inputNode installTapOnBus:0
                    bufferSize:1024
                        format:recordingFormat
                         block:^(AVAudioPCMBuffer *buffer, AVAudioTime *when) {
     [self.recognitionRequest appendAudioPCMBuffer:buffer];
     
     //handle buffer amplitude:
     float derived_amplitude = [self getMaxAudioBufferAmplitude:buffer];
     self->current_max_amplitude = derived_amplitude;
    // NSLog(@"Amplitude: %f",derived_amplitude);
  
   }];

   [self.audioEngine prepare];
   [self.audioEngine startAndReturnError:&err];

   if (err) {
     NSLog(@"Audio engine start error: %@", err.localizedDescription);
   }


}

RCT_REMAP_METHOD(stopConverse,
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject )
      {
  [self stopRecognitionSafely];
  resolve(@"speech detection paused");
}


RCT_REMAP_METHOD(
                 converse,
                 
                 instructions_extra:(NSString *)instructions_extra
                 
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject
                 ){
  
  
  //request permission
  [[AVAudioSession sharedInstance] requestRecordPermission:^(BOOL granted) {
    if(granted){
      //run audio capture function
      dispatch_async(dispatch_get_main_queue(), ^(){
        self->recentInstructions = instructions_extra;
        [self startMicCapture ];
        resolve(@"conversation initialized");
      });
      
    }else{
      NSLog(@"mic permissions deinied or uunavailable");
      reject(@"Mic denied or permission not granted", @"Mic acces deined or unavailable", nil);
    }
  }];
  
}
//text input promt stream --> stream Agentic AI response (conversational): END



//text prompt ---> speech output (creative): START
RCT_REMAP_METHOD(synced_text_to_speech,
                   txt:(NSString *)txt
                   resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)reject){

  [self prompt_gpt:txt additionalInstructions:@" " resolve:^(NSString * _Nullable result, NSError * _Nullable err) {
  if(err){
    reject(@"Error in synced_text_to_speech", NULL, err);
  }else{
    [self playOpenAIAudioFromText:result withCompletion:^{
 
    }];
  }
}];
  
}
//text prompt ---> speech output (creative): END





//text prompt ---> text output api (creative): START
/*
RCT_REMAP_METHOD(promptGPT,
                 prompt:(NSString *)prompt
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
 */
RCT_REMAP_METHOD(promptGPT,
                  prompt:(NSString *)prompt
                  instructions:(NSString *)instructions
                  resolver:(RCTPromiseResolveBlock) resolver
                  rejecter:(RCTPromiseRejectBlock)reject)
                  {
  
  [self prompt_gpt:prompt additionalInstructions:instructions resolve:^(NSString * _Nullable result, NSError *err) {
    if(err){
      reject(@"Error in promppt_gpt native method",nil,err);
    }else{
      resolver(result);
    }
  }];
  
}

-(void)prompt_gpt:(NSString *)prompt
        additionalInstructions:(NSString *)additionalIstructions
        resolve:( void (^) (NSString * _Nullable result, NSError * _Nullable err)) resolve
{
  if(additionalIstructions == nil || additionalIstructions.length == 0){
    additionalIstructions = @"";
  }
  
 NSError *error;
  
  NSDictionary *body = @{
    @"model": @"gpt-4o",
    @"messages": @[
      @{@"role": @"system",
        @"content":[ @"You are an expert, yet humble and goal driven boxing coach. You answer the user with short but sweet and efficient responses that answers the most crucial concerns, questions or worries of the user. Knowing this, your answers are based on the sweet science of boxing, and backed up by contemporary, proven and trustworthy nutrition, fitness and also empirical knowledge for any knowledge buckets you access. For reference, knowledge buckets are basically knowledge types that you access, like fitness, nutrition, strength and conditioning or boxing knowledge. Final remarks: do not sugar code, and do not add unnecessary dialogue or conversation incentivizing characters/content in your responses, answer straightforward but as effectively as possible. " stringByAppendingString: additionalIstructions]
      },
      @{
        @"role": @"user",
        @"content": prompt
      }
    ],
    @"stream": @(NO)
  };
  
  NSURL *url = [NSURL URLWithString:@"https://api.openai.com/v1/chat/completions"];
  
  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:body options:0 error:&error];
  if (error) {
    resolve(nil, error);
    return;
  }
  
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
  [request setHTTPMethod:@"POST"];
  [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
  [request setValue:[NSString stringWithFormat:@"Bearer %@", self->apiKey] forHTTPHeaderField:@"Authorization"];
  [request setHTTPBody:jsonData];
  
  NSURLSession *session = [NSURLSession sharedSession];
  NSURLSessionDataTask *task = [session dataTaskWithRequest:request
                                          completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    if (error) {
     resolve(nil, error);
      return;
    }
    
    if (!data) {
      resolve(nil, error);
      return;
    }
    
    NSError *jsonParseError;
    NSDictionary *jsonResponse = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonParseError];
    if (jsonParseError) {
      resolve(nil, jsonParseError);
      return;
    }
    
    NSArray *choices = jsonResponse[@"choices"];
    if (!choices || choices.count == 0) {
      resolve(nil, error);
      return;
    }
    
    NSString *generatedText = choices[0][@"message"][@"content"];
    if (!generatedText) {
       resolve(nil, error);
      return;
    }
    
    resolve(generatedText, error);
  }];
  
  [task resume];
}
//text prompt ---> text output api (creative): END


//text input ---> speech translation (non-creative): START
RCT_EXPORT_METHOD(speak:(NSString *)txt) {
  [self playOpenAIAudioFromText:txt withCompletion:^{
    
  }];
}
- (void)playOpenAIAudioFromText: (NSString *)txt withCompletion:(void (^)(void))completion  {
  NSError *error;
 
  NSURL *url = [NSURL URLWithString:@"https://api.openai.com/v1/audio/speech"];
  
  NSDictionary *bodyDict = @{
     @"model": @"tts-1",
     @"input": txt,
     @"voice": @"ash",
     @"response_format": @"mp3"
   };
   
  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:bodyDict options:0 error:&error];
  
  NSMutableURLRequest *reqst = [NSMutableURLRequest requestWithURL:url];
  [reqst setHTTPMethod:@"POST"];
  [reqst setValue: @"application/json" forHTTPHeaderField:@"Content-Type"];
  [reqst setValue:[NSString stringWithFormat:@"Bearer %@", self->apiKey] forHTTPHeaderField:@"Authorization"];
  [reqst setHTTPBody:jsonData];
  
  NSURLSession *session = [NSURLSession sharedSession];
  NSURLSessionDataTask *task = [
    session dataTaskWithRequest:reqst
    completionHandler:^(NSData *data, NSURLResponse *url_response, NSError *error){
      if(error){
        RCTLogError(@"Error in native side reqst: %@", error.localizedDescription);
        return;
      }
      
      
      NSString *tmpPath = [NSTemporaryDirectory() stringByAppendingPathComponent:@"tts.mp3"];
      NSURL *filePTH = [NSURL fileURLWithPath:tmpPath];
      [data writeToURL:filePTH atomically:YES];
      
      /*
      dispatch_async(dispatch_get_main_queue(),^{
        AVPlayerItem *itm = [AVPlayerItem playerItemWithURL:filePTH];
        [self.audioPlayer replaceCurrentItemWithPlayerItem:itm];
        [self.audioPlayer play];
        
      });
      */
      
      dispatch_async(dispatch_get_main_queue(), ^{
        
        NSError *audioErr = nil;
        AVAudioSession *audioSession = [AVAudioSession sharedInstance];

        // 🔊 Set playback mode before playing TTS to use loud speaker
        [audioSession setCategory:AVAudioSessionCategoryPlayback error:&audioErr];
        [audioSession setActive:YES error:&audioErr];

        if (audioErr) {
           NSLog(@"Error setting playback category: %@", audioErr.localizedDescription);
         }
        
           AVPlayerItem *itm = [AVPlayerItem playerItemWithURL:filePTH];
           [self.audioPlayer replaceCurrentItemWithPlayerItem:itm];
           [self.audioPlayer play];

           // Safely handle playback completion
           __block id playbackObserver = [[NSNotificationCenter defaultCenter]
             addObserverForName:AVPlayerItemDidPlayToEndTimeNotification
                         object:itm
                          queue:[NSOperationQueue mainQueue]
                     usingBlock:^(NSNotification *note) {
             [[NSNotificationCenter defaultCenter] removeObserver:playbackObserver];
             if (completion) completion();
           }];
         });
      
    }];
  
  
  [task resume];
  
}
//text input ---> speech translation (non-creative): END

@end





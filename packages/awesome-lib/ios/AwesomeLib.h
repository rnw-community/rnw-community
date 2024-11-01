
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNAwesomeLibSpec.h"

@interface AwesomeLib : NSObject <NativeAwesomeLibSpec>
#else
#import <React/RCTBridgeModule.h>

@interface AwesomeLib : NSObject <RCTBridgeModule>
#endif

@end

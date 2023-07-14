
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNPaymentsSpec.h"

@interface Payments : NSObject <NativePaymentsSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Payments : NSObject <RCTBridgeModule>
#endif

@end

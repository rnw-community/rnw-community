#import <UIKit/UIKit.h>
#import <PassKit/PassKit.h>

#import <React/RCTUtils.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNPaymentsSpec.h"

@interface Payments : NSObject<NativePaymentsSpec, PKPaymentAuthorizationViewControllerDelegate>

#else

#import <React/RCTBridgeModule.h>
@interface Payments : NSObject<RCTBridgeModule, PKPaymentAuthorizationViewControllerDelegate>

#endif

@property (nonatomic, strong) PKPaymentAuthorizationViewController * _Nullable viewController;
@property (nonatomic, copy) void (^__strong _Nonnull completion)(PKPaymentAuthorizationResult * _Nonnull __strong);
@property (nonatomic, copy) RCTPromiseResolveBlock _Nullable paymentResolve;
@property (nonatomic, copy) RCTPromiseRejectBlock _Nullable paymentReject;

@end

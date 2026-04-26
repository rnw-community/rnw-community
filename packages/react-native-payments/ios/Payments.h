#import <UIKit/UIKit.h>
#import <PassKit/PassKit.h>

#import <React/RCTUtils.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNPaymentsSpec.h"

@interface Payments : RCTEventEmitter<NativePaymentsSpec, PKPaymentAuthorizationViewControllerDelegate>

#else

#import <React/RCTBridgeModule.h>
@interface Payments : RCTEventEmitter<RCTBridgeModule, PKPaymentAuthorizationViewControllerDelegate>

#endif

@property (nonatomic, strong) PKPaymentAuthorizationViewController * _Nullable viewController;
@property (nonatomic, copy) void (^__strong _Nonnull completion)(PKPaymentAuthorizationResult * _Nonnull __strong);
@property (nonatomic, copy) RCTPromiseResolveBlock _Nullable paymentResolve;
@property (nonatomic, copy) RCTPromiseRejectBlock _Nullable paymentReject;
@property (nonatomic, copy, nullable) void (^paymentMethodCompletion)(PKPaymentRequestPaymentMethodUpdate * _Nonnull);

@end

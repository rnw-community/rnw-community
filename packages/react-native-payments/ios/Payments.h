#import <UIKit/UIKit.h>
#import <PassKit/PassKit.h>

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUtils.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNPaymentsSpec.h"

// Should we use https://developer.apple.com/documentation/passkit/pkpaymentauthorizationcontroller?changes=latest_major&language=objc
// As it will support watchOS?
@interface Payments : RCTEventEmitter<NativePaymentsSpec, PKPaymentAuthorizationViewControllerDelegate>

#else
#import <React/RCTBridgeModule.h>

@interface Payments : RCTEventEmitter<RCTBridgeModule, PKPaymentAuthorizationViewControllerDelegate>
#endif

@property (nonatomic, strong) PKPaymentAuthorizationViewController * _Nullable viewController;
@property (nonatomic, copy) void (^__strong _Nonnull completion)(PKPaymentAuthorizationResult * _Nonnull __strong);

- (NSArray<PKPaymentSummaryItem *> *_Nonnull)getPaymentSummaryItemsFromDetails:(NSDictionary *_Nonnull)details;
- (PKPaymentSummaryItem *_Nonnull)convertDisplayItemToPaymentSummaryItem:(NSDictionary *_Nonnull)displayItem;
- (NSDictionary *)objectToDictionary:(NSObject *)object;

@end

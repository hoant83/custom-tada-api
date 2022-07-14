export const NOTI_TYPE = {
  NEW_ACCOUNT: 'NEW_ACCOUNT',
  ACCOUNT_VERIFIED: 'ACCOUNT_VERIFIED',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  //  customer
  NEW_ORDER: 'NEW_ORDER',
  EDIT_ORDER: 'EDIT_ORDER',
  ORDER_ACCEPTED: 'ORDER_ACCEPTED',
  ORDER_CANCELLED_SUCCESSFULLY: 'ORDER_CANCELLED_SUCCESSFULLY',
  CUSTOMER_FIND_NEW_TRUCK: 'CUSTOMER_FIND_NEW_TRUCK',
  CANCELLED_BEFORE_ASSIGNED: 'CANCELLED_BEFORE_ASSIGNED',
  CANCELLED_AFTER_ASSIGNED: 'CANCELLED_AFTER_ASSIGNED',
  ORDER_ASSIGNED_SUCESS: 'ORDER_ASSIGNED_SUCESS',
  PICKUP_AND_DELIVERY_CODE: 'PICKUP_AND_DELIVERY_CODE',
  DRIVER_ON_THE_WAY: 'DRIVER_ON_THE_WAY',
  PICKUP_ARRIVED: 'PICKUP_ARRIVED',
  PICKUP_CODE: 'PICKUP_CODE',
  PICKUP_SUCCESSFULLY: 'PICKUP_SUCCESSFULLY',
  ORDER_ARRIVED: 'ORDER_ARRIVED',
  DELIVERY_CODE: 'DELIVERY_CODE',
  ORDER_COMPLETE: 'ORDER_COMPLETE',
  CUSTOMER_SELF_PAYMENT_DONE: 'CUSTOMER_SELF_PAYMENT_DONE',
  TRUCK_PAYMENT_DONE: 'TRUCK_PAYMENT_DONE',
  ADJUST_FARE: 'ADJUST_FARE',
  //  truckowner
  TRUCK_NEW_ORDER: 'TRUCK_NEW_ORDER',
  TRUCK_ORDER_ACCEPT: 'TRUCK_ORDER_ACCEPT',
  FIND_NEW_TRUCK: 'FIND_NEW_TRUCK',
  TRUCK_CUSTOMER_EDIT_ORDER: 'TRUCK_CUSTOMER_EDIT_ORDER',
  TRUCK_CANCELLED_ORDER_SUCCESS: 'TRUCK_CANCELLED_ORDER_SUCCESS',
  CUSTOMER_CANCELLED_ORDER: 'CUSTOMER_CANCELLED_ORDER',
  TRUCK_ASSIGNED_SUCCESS: 'TRUCK_ASSIGNED_SUCCESS',
  REMIND_BEFORE_PICKUP: 'REMIND_BEFORE_PICKUP',
  TRUCK_DRIVER_ON_THE_WAY: 'DRIVER_ON_THE_WAY',
  TRUCK_PICKUP_ARRIVED: 'TRUCK_PICKUP_ARRIVED',
  ENTER_PICKUP_CODE: 'ENTER_PICKUP_CODE',
  TRUCK_PICKUP_SUCCESSFULLY: 'TRUCK_PICKUP_SUCCESSFULLY',
  TRUCK_ORDER_ARRIVED: 'TRUCK_ORDER_ARRIVED',
  ENTER_DELIVERY_CODE: 'ENTER_DELIVERY_CODE',
  TRUCK_ORDER_COMPLETE: 'TRUCK_ORDER_COMPLETE',
  FAVORITE_TRUCK: 'FAVORITE_TRUCK',
  PRICE_ADJUST: 'PRICE_ADJUST',
  CUSTOMER_PAYMENT_DONE: 'CUSTOMER_PAYMENT_DONE',
  TRUCK_SELF_PAYMENT_DONE: 'TRUCK_SELF_PAYMENT_DONE',
  CUSTOMER_ADJUST_FARE: 'CUSTOMER_ADJUST_FARE',
  LIMIT_ORDER: 'LIMIT_ORDER',
};

export const NOTI_SUBJECT = {
  NEW_ACCOUNT: 'Create new account successfully',
  ACCOUNT_VERIFIED: 'Account verified',
  EMAIL_VERIFIED: 'Verify email address',
  //  customer
  NEW_ORDER: 'Create new order successfully',
  EDIT_ORDER: 'Editing Order Confirmation',
  ORDER_ACCEPTED: 'Order is accepted',
  ORDER_CANCELLED_SUCCESSFULLY: 'Order is cancelled successfully ',
  CUSTOMER_FIND_NEW_TRUCK: 'Customer wants to find new truck operator',
  CANCELLED_BEFORE_ASSIGNED:
    'Truck owner/ Driver cancelled order before assigned',
  CANCELLED_AFTER_ASSIGNED:
    'Truck owner/ Driver cancelled order after assigned',
  ORDER_ASSIGNED_SUCESS: 'Order is assigned successfully ',
  PICKUP_AND_DELIVERY_CODE: 'Pickup and delivery code',
  DRIVER_ON_THE_WAY: 'Driver is on the way to pick up',
  PICKUP_ARRIVED: 'Pickup arrived',
  PICKUP_CODE: 'Enter Pickup code',
  PICKUP_SUCCESSFULLY: 'Order is picked up successfully',
  ORDER_ARRIVED: 'Order arrived ',
  DELIVERY_CODE: 'Enter Delivery code',
  ORDER_COMPLETE: 'Order completely sucessfully',
  ADDITIONAL_FARE_ADDED: 'Additional fare is added successfully',
  CUSTOMER_SELF_PAYMENT_DONE: 'Customer set Payment done',
  TRUCK_PAYMENT_DONE: 'Truck Onwer set Payment done',
  ADJUST_FARE: 'Additional fare is added successfully',
  //  truckowner
  TRUCK_NEW_ORDER: 'You have new order',
  TRUCK_ORDER_ACCEPT: 'You accepted a new order',
  FIND_NEW_TRUCK: 'Customer cancelled the order',
  TRUCK_CUSTOMER_EDIT_ORDER: 'Your order was edited',
  TRUCK_CANCELLED_ORDER_SUCCESS: 'You cancelled the order',
  CUSTOMER_CANCELLED_ORDER: 'Customer cancelled the order',
  TRUCK_ASSIGNED_SUCCESS: 'The order was assigned',
  REMIND_BEFORE_PICKUP: 'Just start you order!',
  TRUCK_DRIVER_ON_THE_WAY: 'Order is on pickup',
  TRUCK_PICKUP_ARRIVED: 'Driver arrived pickup point',
  ENTER_PICKUP_CODE: 'Pickup code was updated',
  TRUCK_PICKUP_SUCCESSFULLY: 'Order was picked up',
  TRUCK_ORDER_ARRIVED: 'Driver arrived destination',
  ENTER_DELIVERY_CODE: 'Delivery code was updated',
  TRUCK_ORDER_COMPLETE: 'Order was completed',
  FAVORITE_TRUCK: 'You are Favorite-Truck-operator',
  CUSTOMER_ADJUSTED_FARE: 'Customer adjusted fare',
  CUSTOMER_PAYMENT_DONE: 'Customer set Payment done',
  TRUCK_SELF_PAYMENT_DONE: 'Truck Onwer set Payment done',
  CUSTOMER_ADJUST_FARE: 'Customer adjusted fare',
  LIMIT_ORDER: 'Your maximum order quantity is running out',
};

export const VI_NOTI_SUBJECT = {
  NEW_ACCOUNT: 'TADA Truck xin chào!',
  ACCOUNT_VERIFIED: 'Tài khoản đã xác thực',
  EMAIL_VERIFIED: 'Đã xác thưc email',
  //  customer
  NEW_ORDER: 'Tạo đơn hàng thành công',
  EDIT_ORDER: 'Chỉnh sửa đơn hàng',
  ORDER_ACCEPTED: 'Đơn đã được chấp nhận',
  ORDER_CANCELLED_SUCCESSFULLY: 'Hủy đơn thành công',
  CUSTOMER_FIND_NEW_TRUCK: 'Khách hàng muốn tìm chủ xe khác',
  CANCELLED_BEFORE_ASSIGNED: 'Chủ xe / tài xế đã hủy đơn',
  CANCELLED_AFTER_ASSIGNED: 'Chủ xe / tài xế đã hủy đơn sau khi sắp xếp',
  ORDER_ASSIGNED_SUCESS: 'Đơn hàng đã sắp xếp xong',
  PICKUP_AND_DELIVERY_CODE: 'Mã giao nhận đơn hàng',
  DRIVER_ON_THE_WAY: 'Tài xế đang đến nơi lấy hàng',
  PICKUP_ARRIVED: 'Đã đến nơi lấy hàng',
  PICKUP_CODE: 'Mã lấy hàng đã được nhập',
  PICKUP_SUCCESSFULLY: 'Lấy hàng thành công',
  ORDER_ARRIVED: 'Đơn hàng đã đến nơi chỉ định',
  DELIVERY_CODE: 'Mã giao hàng đã được nhập',
  ORDER_COMPLETE: 'Đơn hàng đã hoàn thành',
  //  truckowner
  TRUCK_NEW_ORDER: 'Đơn hàng mới đang chờ',
  TRUCK_ORDER_ACCEPT: 'Đã chấp nhận đơn hàng',
  FIND_NEW_TRUCK: 'Đơn hàng đã hủy',
  TRUCK_CUSTOMER_EDIT_ORDER: 'Đơn hàng có chỉnh sửa mới',
  TRUCK_CANCELLED_ORDER_SUCCESS: 'Bạn đã hủy đơn',
  CUSTOMER_CANCELLED_ORDER: 'Đơn hàng đã hủy',
  TRUCK_ASSIGNED_SUCCESS: 'Đơn hàng đã sắp xếp xong',
  REMIND_BEFORE_PICKUP: 'Đừng quên thực hiện đơn hàng!',
  TRUCK_DRIVER_ON_THE_WAY: 'Đang lấy hàng',
  TRUCK_PICKUP_ARRIVED: 'Đã đến điểm lấy hàng',
  ENTER_PICKUP_CODE: 'Đã nhập Mã lấy hàng',
  TRUCK_PICKUP_SUCCESSFULLY: 'Đã lấy hàng',
  TRUCK_ORDER_ARRIVED: 'Đã đến điểm giao hàng',
  ENTER_DELIVERY_CODE: 'Đã nhập mã giao hàng',
  TRUCK_ORDER_COMPLETE: 'Hoàn tất đơn hàng',
  FAVORITE_TRUCK: 'Bạn là Nhà vận chuyển yêu thích',
  CUSTOMER_ADJUSTED_FARE: 'Khách hàng đã điều chỉnh giá',
  CUSTOMER_PAYMENT_DONE: 'Khách hàng đã thanh toán',
  TRUCK_SELF_PAYMENT_DONE: 'Chủ xe đã xác nhận thanh toán',
  CUSTOMER_ADJUST_FARE: 'Khách hàng đã điều chỉnh giá',
  LIMIT_ORDER: 'số lượng đơn hàng tối đa của bạn sắp hết',
};

export const NOTI_CONTENT = {
  NEW_ACCOUNT: 'Welcome to TADA Truck. Your account has been verified. ',
  ACCOUNT_VERIFIED: 'You have successfully verified your account',
  EMAIL_VERIFIED:
    'Your email has been verified. Please check your inbox regularly',
  //  customer
  NEW_ORDER:
    'Your order [orderID] has been successfully created. We are looking for truck owners/drivers for you.',
  EDIT_ORDER:
    'Your order [orderID] has been successfully modified. Please check the information in the application.',
  ORDER_ACCEPTED: 'We have found a truck owner/driver for your order [orderID]',
  ORDER_CANCELLED_SUCCESSFULLY:
    'You have successfully cancelled your order [orderID]',
  CUSTOMER_FIND_NEW_TRUCK:
    'Your order [orderID] has been sent back to our systems. We are looking for another truck owner/driver.',
  CANCELLED_BEFORE_ASSIGNED:
    'Unfortunately, truck owner/driver has declined your order [orderID]. We are looking for other truck owners/drivers.',
  CANCELLED_AFTER_ASSIGNED:
    'Unfortunately, your order [orderID] was accepted unsuccessfully. We are looking forward to assisting you in your next order.',
  ORDER_ASSIGNED_SUCESS:
    'Truck owner [truckownerID] is carrying out your order [orderID]. Please check your inbox for more information.',
  PICKUP_AND_DELIVERY_CODE:
    'Please check your inbox for your pickup and delivery codes [orderID]',
  DRIVER_ON_THE_WAY: 'Driver is on their way to pick up your order [orderID]',
  PICKUP_ARRIVED: 'Driver has arrived at the pickup place [orderID]',
  PICKUP_CODE:
    'Driver has entered Pickup code of the order [orderID] successfully',
  PICKUP_SUCCESSFULLY:
    'Your order [orderID] has been picked up successfully. Please wait and follow your order via the website/application',
  ORDER_ARRIVED: 'Your order [orderID] has arrived successfully.',
  DELIVERY_CODE:
    'Driver has entered Delivery code of the order [orderID] successfully',
  ORDER_COMPLETE:
    'Congratulations, our order [orderID] has been delivered successfully.',
  TRUCK_NEW_ORDER:
    'There is a new order! Please check New Order on our website!',
  TRUCK_ORDER_ACCEPT:
    'You have successfully accepted order [orderID]. Please contact the customer',
  FIND_NEW_TRUCK:
    'Unfortunately, the customer has chosen another truck owner for the order [orderID]. Please check New Order on our website!',
  TRUCK_CUSTOMER_EDIT_ORDER:
    'The customer has just edited the order [orderID]. Please check the lastest update of the order.',
  TRUCK_CANCELLED_ORDER_SUCCESS:
    'You have rejected the order [orderID]. Please check our website and application for more orders.',
  CUSTOMER_CANCELLED_ORDER:
    'Unfortunately, the order [orderID] has been cancelled. Please check New Order on our website!',
  TRUCK_ASSIGNED_SUCCESS:
    'The order [orderID] has been assigned to driver [name]. Please follow the order status on the website or application ',
  REMIND_BEFORE_PICKUP:
    'The order [orderID] is waiting for you. Please check the information carefully or you may miss this order.',
  TRUCK_DRIVER_ON_THE_WAY:
    'Driver [name] is on their way to pick up the order [orderID]',
  TRUCK_PICKUP_ARRIVED:
    'You have arrived the pick up place of the order [orderID]. Please check you rmobile app and contact the customer.',
  ENTER_PICKUP_CODE:
    'Your driver has updated Pickup code of the order [orderID] successfully.',
  TRUCK_PICKUP_SUCCESSFULLY:
    'The order [orderID] has been picked up successfully. Please start your delivery',
  TRUCK_ORDER_ARRIVED:
    'The order [orderID] has been delivered to the drop off place successfully.',
  ENTER_DELIVERY_CODE:
    'Your driver has updated Delivery code of the order [orderID] successfully.',
  TRUCK_ORDER_COMPLETE:
    'Congratulations, you have successfully delivered the order [orderID]. Please check our website and application for more orders.',
  FAVORITE_TRUCK:
    'Congratulations, [customerID] has added you as Favorite-Truck-operator. Please keep up your good work.',
  PRICE_ADJUST: 'PRICE_ADJUST',
  CUSTOMER_SELF_PAYMENT_DONE:
    'You completed the payment of order [orderID] successfully.',
  TRUCK_PAYMENT_DONE:
    'Truck owner confirmed your payment of the order [orderID]',
  CUSTOMER_PAYMENT_DONE:
    'Your customer confirmed the order [orderID] was paid successfully. Please check you account',
  TRUCK_SELF_PAYMENT_DONE:
    'Youve just confirmed the payment of order [orderID]',
  ADJUST_FARE: 'Additional fare is added to order [orderID] successfully ',
  CUSTOMER_ADJUST_FARE:
    'Total fare of order [orderID] was adjusted by your customer. Please check details on website/ your app.',
  LIMIT_ORDER: 'The amount of monthly limited order quantity is running out of',
};

export const VI_NOTI_CONTENT = {
  NEW_ACCOUNT:
    'Chào mừng bạn đến với TADA Truck. Tài khoản của bạn đã đăng ký thành công. Hãy bắt đầu hành trình mới cùng TADA Truck!',
  ACCOUNT_VERIFIED:
    'Chúc mừng bạn đã xác thực tài khoản thành công. Tiếp tục tìm hiểu nền tảng TADA Truck qua website bạn nhé!',
  EMAIL_VERIFIED:
    'Email đã được xác nhận. Đừng quên kiểm tra hộp thư thường xuyên để không bỏ lỡ thông tin!',
  //  customer
  NEW_ORDER:
    'Đơn hàng [orderID] đã được tạo thành công. Hệ thống sẽ nhanh chóng giúp bạn tìm thấy chủ xe/ tài xế cho đơn hàng này.',
  EDIT_ORDER:
    'Đơn hàng [orderID] đã được chỉnh sửa thành công. Kiểm tra lại thông tin trong ứng dụng nhé!',
  ORDER_ACCEPTED: 'Chủ xe/ tài xế đã được tìm thấy cho đơn hàng [orderID]',
  ORDER_CANCELLED_SUCCESSFULLY: 'Bạn đã hủy đơn hàng [orderID] thành công. ',
  CUSTOMER_FIND_NEW_TRUCK:
    'Đơn hàng [orderID] đã được gửi trở lại hệ thống, chúng tôi sẽ nhanh chóng giúp bạn kết nối với các chủ xe/ tài xế khác.',
  CANCELLED_BEFORE_ASSIGNED:
    'Rất tiếc, chủ xe [truckOwnerID] đã từ chối đơn hàng [orderID]. Các chủ xe/ tài xế khác đang được tim kiếm, vui lòng chờ trong giây lát!',
  CANCELLED_AFTER_ASSIGNED:
    'Rất tiếc đơn hàng [orderID] đã không được thực hiện thành công. Mong sớm được đồng hàng cùng bạn cho những đơn hàng tiếp theo.',
  ORDER_ASSIGNED_SUCESS:
    'Chủ xe [truckownerID] đang chuẩn bị thực hiện đơn hàng [orderID] của bạn. Vui lòng kiểm tra hộp thư để biết thêm chi tiết',
  PICKUP_AND_DELIVERY_CODE:
    'Vui lòng kiểm tra ngay hộp thư của bạn để nhận được Mã lấy và giao hàng cho đơn hàng [orderID].',
  DRIVER_ON_THE_WAY:
    'Tài xế đang trên đường đến nhận đơn hàng [orderID] của bạn.',
  PICKUP_ARRIVED:
    'Tài xế đã đến địa điểm được chỉ định để lấy đơn hàng [orderID]',
  PICKUP_CODE:
    'Tài xế vừa cập nhật thành công Mã lấy hàng của đơn hàng [orderID]',
  PICKUP_SUCCESSFULLY:
    'Đơn hàng [orderID] đã được lấy thành công. Bạn yên tâm chờ đợi và theo dõi hành trình này nhé!',
  ORDER_ARRIVED: 'Đơn hàng [orderID] đã đến địa điểm cần giao an toàn.',
  DELIVERY_CODE:
    'Tài xế vừa cập nhật thành công Mã giao hàng của đơn hàng [orderID]',
  ORDER_COMPLETE:
    'Đơn hàng [orderID] đã được thực hiện thành công bởi chủ xe [truckID]',
  //  truckowner
  TRUCK_NEW_ORDER:
    'Có một đơn hàng mới! Hãy nhanh tay kiểm tra mục Đơn hàng mới trên web!',
  TRUCK_ORDER_ACCEPT:
    'Nhận đơn hàng [orderID] thành công. Khách hàng đang đợi bạn, hãy nhanh chóng liên hệ!',
  FIND_NEW_TRUCK:
    'Rất tiếc khách hàng đã có sự lựa chọn khác cho đơn hàng [orderID]. Bạn có thể tìm thêm cơ hội mới tại mục Đơn hàng mới.',
  TRUCK_CUSTOMER_EDIT_ORDER:
    'Đơn hàng [orderID] đã có sự điều chỉnh mới. Hãy kiểm tra thông tin cập nhật để thuận tiện cho việc thực hiện đơn hàng bạn nhé! ',
  TRUCK_CANCELLED_ORDER_SUCCESS:
    'Bạn đã từ chối đơn hàng [orderID]. Hãy tìm kiếm cơ hội khác phù hợp hơn ở ứng dụng nhé!',
  CUSTOMER_CANCELLED_ORDER:
    'Rất tiếc, đơn hàng [orderID] đã bị hủy. Hãy truy cập Đơn hàng mới để tìm cơ hội khác!',
  TRUCK_ASSIGNED_SUCCESS:
    'Đơn hàng [orderID] đã được giao cho tài xế [name]. vui lòng theo dõi đơn hàng tại ứng dụng TADA Truck hoặc website thường xuyên.',
  REMIND_BEFORE_PICKUP:
    'Đơn hàng [orderID] đang chờ bạn đến lấy. Nhớ kiểm tra thông tin để tránh quên đơn hàng nhé! ',
  TRUCK_DRIVER_ON_THE_WAY:
    'Tài xế [name] đang trên đường đến lấy đơn hàng [orderID]',
  TRUCK_PICKUP_ARRIVED:
    'Bạ̣n đã đến điểm lấy đơn hàng [orderID]. Vui lòng kiểm tra ứng dụng và liên hệ khách hàng',
  ENTER_PICKUP_CODE:
    'Tài xế của bạn vừa cập nhật thành công Mã lấy hàng cho đơn hàng [orderID].',
  TRUCK_PICKUP_SUCCESSFULLY:
    'Đơn hàng [orderID] đã được lấy thành công. Hãy tiếp tục hành trình để về đến đích nào!',
  TRUCK_ORDER_ARRIVED:
    'Đơn hàng [orderID] đã được vận chuyển đến địa điểm chỉ định an toàn.',
  ENTER_DELIVERY_CODE:
    'Tài xế của bạn vừa cập nhật thành công Mã giao hàng cho đơn hàng [orderID].',
  TRUCK_ORDER_COMPLETE:
    'Chúc mừng bạn hoàn tất đơn hàng [orderID]. Đừng quên tìm kiếm đơn hàng khác để bắt đầu chuyến đi mới nhé!',
  FAVORITE_TRUCK:
    '[customerID] đã thêm bạn vào danh sách Nhà vận chuyển yêu thích. Hãy tiếp tục nâng cao chất lượng dịch vụ bạn nhé!',
  CUSTOMER_SELF_PAYMENT_DONE:
    'Đơn hàng [orderID] đã được cập nhật tình trạng Thanh toán thành công',
  TRUCK_PAYMENT_DONE:
    'Chủ xe xác nhận đã nhận thanh toán của đơn hàng [orderID]',
  CUSTOMER_PAYMENT_DONE:
    'Đơn hàng [orderID] đã được khách hàng xác nhận thanh toán thành công',
  TRUCK_SELF_PAYMENT_DONE:
    'Bạn xác nhận đã nhận thanh toán của đơn hàng [orderID]',
  ADJUST_FARE: 'Phụ phí thanh toán đã được cập nhật cho đơn hàng [orderID]',
  CUSTOMER_ADJUST_FARE:
    '[customerID] đã điều chỉnh giá đơn hàng [orderID]. Vui lòng kiểm tra thông tin cập nhật từ trang web/ ứng dụng.',
  LIMIT_ORDER: 'Số lượng đơn hàng tối đa hằng tháng của bạn sắp hết',
};

export const KR_NOTI_CONTENT = {
  NEW_ACCOUNT:
    'TADA Truck에 오신 것을 환영합니다. 고객님의 계정이 인증되었습니다.',
  ACCOUNT_VERIFIED: '고객님께서 계정 인증에 성공하였습니다.',
  EMAIL_VERIFIED:
    '고객님의 이메일이 인증 완료 되었습니다. 정기적으로 수신함을 확인해 주시기 바랍니다.',
  //  customer
  NEW_ORDER:
    '고객님의 주문 [orderID]이 접수되었습니다. 현재 고객님을 위해 트럭 사업자/운전자를 검색 중입니다.',
  EDIT_ORDER:
    '고객님의 주문 [orderID]이 변경되었습니다. 애플리케이션 내의 정보를 확인해 주시기 바랍니다.',
  ORDER_ACCEPTED:
    '고객님의 주문 [orderID]을 배송할 트럭 사업자/운전자를 찾았습니다.',
  ORDER_CANCELLED_SUCCESSFULLY: '고객님의 주문 [orderID]이 취소되었습니다.',
  CUSTOMER_FIND_NEW_TRUCK:
    '고객님의 주문 [orderID]이 반송되었습니다. 현재 다른 트럭 사업자/운전자를 검색 중입니다.',
  CANCELLED_BEFORE_ASSIGNED:
    '트럭 사업자/운전자가 고객님의 주문[orderID] 접수를 반려하였습니다. 현재 다른 트럭 사업자/운전자를 검색 중입니다.',
  CANCELLED_AFTER_ASSIGNED:
    '죄송합니다. 고객님의 주문[orderID] 승인에 실패하였습니다. 다음 거래에 꼭 다시 만나 뵙기를 고대하겠습니다.',
  ORDER_ASSIGNED_SUCESS:
    '트럭 사업자 [truckownerID]가 고객님의 주문 [orderID]을 승인하였습니다. 수신함에서 정보를 확인해 주시기 바랍니다.',
  PICKUP_AND_DELIVERY_CODE:
    '[orderID]에 대한 집화 및 배송 코드를 고객님의 수신함에서 확인해 주시기 바랍니다.',
  DRIVER_ON_THE_WAY:
    '배송 기사님이 고객님의 주문[orderID] 집화를 위해 이동 중입니다.',
  PICKUP_ARRIVED:
    '배송 기사님이 고객님의 주문[orderID] 집화지에 도착하였습니다.',
  PICKUP_CODE:
    '배송 기사님이 고객님의 주문[orderID] 집화 코드를 입력하였습니다.',
  PICKUP_SUCCESSFULLY:
    '고객님의 주문[orderID]의 집화가 완료되었습니다. 웹/앱에서 주문 사항을 확인하시고 기다려 주시기 바랍니다.',
  ORDER_ARRIVED: '고객님의 주문[orderID]이 도착하였습니다.',
  DELIVERY_CODE:
    '배송 기사님이 고객님의 주문[orderID] 배송 코드를 입력하였습니다.',
  ORDER_COMPLETE: '고객님의 주문[orderID]이 성공적으로 배송 완료되었습니다.',
  //  truckowner
  TRUCK_NEW_ORDER:
    'There is a new order! Please check New Order on our website!',
  TRUCK_ORDER_ACCEPT:
    'You have successfully accepted order [orderID]. Please contact the customer',
  FIND_NEW_TRUCK:
    'Unfortunately, the customer has chosen another truck owner for the order [orderID]. Please check New Order on our website!',
  TRUCK_CUSTOMER_EDIT_ORDER:
    'The customer has just edited the order [orderID]. Please check the lastest update of the order.',
  TRUCK_CANCELLED_ORDER_SUCCESS:
    'You have rejected the order [orderID]. Please check our website and application for more orders.',
  CUSTOMER_CANCELLED_ORDER:
    'Unfortunately, the order [orderID] has been cancelled. Please check New Order on our website!',
  TRUCK_ASSIGNED_SUCCESS:
    'The order [orderID] has been assigned to driver [name]. Please follow the order status on the website or application ',
  REMIND_BEFORE_PICKUP:
    'The order [orderID] is waiting for you. Please check the information carefully or you may miss this order.',
  TRUCK_DRIVER_ON_THE_WAY:
    'Driver [name] is on their way to pick up the order [orderID]',
  TRUCK_PICKUP_ARRIVED:
    'You have arrived the pick up place of the order [orderID]. Please check you rmobile app and contact the customer.',
  ENTER_PICKUP_CODE:
    'Your driver has updated Pickup code of the order [orderID] successfully.',
  TRUCK_PICKUP_SUCCESSFULLY:
    'The order [orderID] has been picked up successfully. Please start your delivery',
  TRUCK_ORDER_ARRIVED:
    'The order [orderID] has been delivered to the drop off place successfully.',
  ENTER_DELIVERY_CODE:
    'Your driver has updated Delivery code of the order [orderID] successfully.',
  TRUCK_ORDER_COMPLETE:
    'Congratulations, you have successfully delivered the order [orderID]. Please check our website and application for more orders.',
  FAVORITE_TRUCK:
    'Congratulations, [customerID] has added you as Favorite-Truck-operator. Please keep up your good work.',
  CUSTOMER_SELF_PAYMENT_DONE: '[orderID] 주문 결제를 완료했습니다.',
  TRUCK_PAYMENT_DONE:
    '트럭 소유주가 주문 [orderID]에 대한 결제를 확인했습니다.',
  CUSTOMER_PAYMENT_DONE:
    'Your customer confirmed the order [orderID] was paid successfully. Please check you account',
  TRUCK_SELF_PAYMENT_DONE:
    'Youve just confirmed the payment of order [orderID]',
  ADJUST_FARE: '[orderID] 주문에 추가 요금이 추가되었습니다.',
  CUSTOMER_ADJUST_FARE:
    'Total fare of order [orderID] was adjusted by your customer. Please check details on website/ your app.',
  LIMIT_ORDER: 'The amount of monthly limited order quantity is running out of',
};

export const KR_NOTI_SUBJECT = {
  NEW_ACCOUNT: 'Create new account successfully',
  ACCOUNT_VERIFIED: 'Account verified',
  EMAIL_VERIFIED: 'Verify email address',
  //  customer
  NEW_ORDER: 'Create new order successfully',
  EDIT_ORDER: 'Editing Order Confirmation',
  ORDER_ACCEPTED: 'Order is accepted',
  ORDER_CANCELLED_SUCCESSFULLY: 'Order is cancelled successfully ',
  CUSTOMER_FIND_NEW_TRUCK: 'Customer wants to find new truck operator',
  CANCELLED_BEFORE_ASSIGNED:
    'Truck owner/ Driver cancelled order before assigned',
  CANCELLED_AFTER_ASSIGNED:
    'Truck owner/ Driver cancelled order after assigned',
  ORDER_ASSIGNED_SUCESS: 'Order is assigned successfully ',
  PICKUP_AND_DELIVERY_CODE: 'Pickup and delivery code',
  DRIVER_ON_THE_WAY: 'Driver is on the way to pick up',
  PICKUP_ARRIVED: 'Pickup arrived',
  PICKUP_CODE: 'Enter Pickup code',
  PICKUP_SUCCESSFULLY: 'Order is picked up successfully',
  ORDER_ARRIVED: 'Order arrived ',
  DELIVERY_CODE: 'Enter Delivery code',
  ORDER_COMPLETE: 'Order completely sucessfully',
  CUSTOMER_SELF_PAYMENT_DONE: 'Customer set Payment done',
  TRUCK_PAYMENT_DONE: 'Truck Onwer set Payment done',
  //  truckowner
  TRUCK_NEW_ORDER: 'You have new order',
  TRUCK_ORDER_ACCEPT: 'You accepted a new order',
  FIND_NEW_TRUCK: 'Customer cancelled the order',
  TRUCK_CUSTOMER_EDIT_ORDER: 'Your order was edited',
  TRUCK_CANCELLED_ORDER_SUCCESS: 'You cancelled the order',
  CUSTOMER_CANCELLED_ORDER: 'Customer cancelled the order',
  TRUCK_ASSIGNED_SUCCESS: 'The order was assigned',
  REMIND_BEFORE_PICKUP: 'Just start you order!',
  TRUCK_DRIVER_ON_THE_WAY: 'Order is on pickup',
  TRUCK_PICKUP_ARRIVED: 'Driver arrived pickup point',
  ENTER_PICKUP_CODE: 'Pickup code was updated',
  TRUCK_PICKUP_SUCCESSFULLY: 'Order was picked up',
  TRUCK_ORDER_ARRIVED: 'Driver arrived destination',
  ENTER_DELIVERY_CODE: 'Delivery code was updated',
  TRUCK_ORDER_COMPLETE: 'Order was completed',
  FAVORITE_TRUCK: 'You are Favorite-Truck-operator',
  CUSTOMER_PAYMENT_DONE: 'Customer set Payment done',
  TRUCK_SELF_PAYMENT_DONE: 'Truck Onwer set Payment done',
  ADJUST_FARE: 'Additional fare is added successfully',
  CUSTOMER_ADJUST_FARE: 'Customer adjusted fare',
  LIMIT_ORDER: 'Your maximum order quantity is running out',
};

export const ID_NOTI_CONTENT = {
  NEW_ACCOUNT: 'Welcome to TADA Truck. Your account has been verified. ',
  ACCOUNT_VERIFIED: 'You have successfully verified your account',
  EMAIL_VERIFIED:
    'Your email has been verified. Please check your inbox regularly',
  //  customer
  NEW_ORDER:
    'Your order [orderID] has been successfully created. We are looking for truck owners/drivers for you.',
  EDIT_ORDER:
    'Your order [orderID] has been successfully modified. Please check the information in the application.',
  ORDER_ACCEPTED: 'We have found a truck owner/driver for your order [orderID]',
  ORDER_CANCELLED_SUCCESSFULLY:
    'You have successfully cancelled your order [orderID]',
  CUSTOMER_FIND_NEW_TRUCK:
    'Your order [orderID] has been sent back to our systems. We are looking for another truck owner/driver.',
  CANCELLED_BEFORE_ASSIGNED:
    'Unfortunately, truck owner/driver has declined your order [orderID]. We are looking for other truck owners/drivers.',
  CANCELLED_AFTER_ASSIGNED:
    'Unfortunately, your order [orderID] was accepted unsuccessfully. We are looking forward to assisting you in your next order.',
  ORDER_ASSIGNED_SUCESS:
    'Truck owner [truckownerID] is carrying out your order [orderID]. Please check your inbox for more information.',
  PICKUP_AND_DELIVERY_CODE:
    'Please check your inbox for your pickup and delivery codes [orderID]',
  DRIVER_ON_THE_WAY: 'Driver is on their way to pick up your order [orderID]',
  PICKUP_ARRIVED: 'Driver has arrived at the pickup place [orderID]',
  PICKUP_CODE:
    'Driver has entered Pickup code of the order [orderID] successfully',
  PICKUP_SUCCESSFULLY:
    'Your order [orderID] has been picked up successfully. Please wait and follow your order via the website/application',
  ORDER_ARRIVED: 'Your order [orderID] has arrived successfully.',
  DELIVERY_CODE:
    'Driver has entered Delivery code of the order [orderID] successfully',
  ORDER_COMPLETE:
    'Congratulations, our order [orderID] has been delivered successfully.',
  TRUCK_NEW_ORDER:
    'There is a new order! Please check New Order on our website!',
  TRUCK_ORDER_ACCEPT:
    'You have successfully accepted order [orderID]. Please contact the customer',
  FIND_NEW_TRUCK:
    'Unfortunately, the customer has chosen another truck owner for the order [orderID]. Please check New Order on our website!',
  TRUCK_CUSTOMER_EDIT_ORDER:
    'The customer has just edited the order [orderID]. Please check the lastest update of the order.',
  TRUCK_CANCELLED_ORDER_SUCCESS:
    'You have rejected the order [orderID]. Please check our website and application for more orders.',
  CUSTOMER_CANCELLED_ORDER:
    'Unfortunately, the order [orderID] has been cancelled. Please check New Order on our website!',
  TRUCK_ASSIGNED_SUCCESS:
    'The order [orderID] has been assigned to driver [name]. Please follow the order status on the website or application ',
  REMIND_BEFORE_PICKUP:
    'The order [orderID] is waiting for you. Please check the information carefully or you may miss this order.',
  TRUCK_DRIVER_ON_THE_WAY:
    'Driver [name] is on their way to pick up the order [orderID]',
  TRUCK_PICKUP_ARRIVED:
    'You have arrived the pick up place of the order [orderID]. Please check you rmobile app and contact the customer.',
  ENTER_PICKUP_CODE:
    'Your driver has updated Pickup code of the order [orderID] successfully.',
  TRUCK_PICKUP_SUCCESSFULLY:
    'The order [orderID] has been picked up successfully. Please start your delivery',
  TRUCK_ORDER_ARRIVED:
    'The order [orderID] has been delivered to the drop off place successfully.',
  ENTER_DELIVERY_CODE:
    'Your driver has updated Delivery code of the order [orderID] successfully.',
  TRUCK_ORDER_COMPLETE:
    'Congratulations, you have successfully delivered the order [orderID]. Please check our website and application for more orders.',
  FAVORITE_TRUCK:
    'Congratulations, [customerID] has added you as Favorite-Truck-operator. Please keep up your good work.',
  CUSTOMER_SELF_PAYMENT_DONE:
    'You completed the payment of order [orderID] successfully.',
  TRUCK_PAYMENT_DONE:
    'Truck owner confirmed your payment of the order [orderID]',
  CUSTOMER_PAYMENT_DONE:
    'Your customer confirmed the order [orderID] was paid successfully. Please check you account',
  TRUCK_SELF_PAYMENT_DONE:
    'Youve just confirmed the payment of order [orderID]',
  ADJUST_FARE: 'Additional fare is added to order [orderID] successfully ',
  CUSTOMER_ADJUST_FARE:
    'Total fare of order [orderID] was adjusted by your customer. Please check details on website/ your app.',
  LIMIT_ORDER: 'Your maximum order quantity is running out',
};

export const ID_NOTI_SUBJECT = {
  NEW_ACCOUNT: 'Create new account successfully',
  ACCOUNT_VERIFIED: 'Account verified',
  EMAIL_VERIFIED: 'Verify email address',
  //  customer
  NEW_ORDER: 'Create new order successfully',
  EDIT_ORDER: 'Editing Order Confirmation',
  ORDER_ACCEPTED: 'Order is accepted',
  ORDER_CANCELLED_SUCCESSFULLY: 'Order is cancelled successfully ',
  CUSTOMER_FIND_NEW_TRUCK: 'Customer wants to find new truck operator',
  CANCELLED_BEFORE_ASSIGNED:
    'Truck owner/ Driver cancelled order before assigned',
  CANCELLED_AFTER_ASSIGNED:
    'Truck owner/ Driver cancelled order after assigned',
  ORDER_ASSIGNED_SUCESS: 'Order is assigned successfully ',
  PICKUP_AND_DELIVERY_CODE: 'Pickup and delivery code',
  DRIVER_ON_THE_WAY: 'Driver is on the way to pick up',
  PICKUP_ARRIVED: 'Pickup arrived',
  PICKUP_CODE: 'Enter Pickup code',
  PICKUP_SUCCESSFULLY: 'Order is picked up successfully',
  ORDER_ARRIVED: 'Order arrived ',
  DELIVERY_CODE: 'Enter Delivery code',
  ORDER_COMPLETE: 'Order completely sucessfully',
  CUSTOMER_SELF_PAYMENT_DONE: 'Customer set Payment done',
  TRUCK_PAYMENT_DONE: 'Truck Onwer set Payment done',
  //  truckowner
  TRUCK_NEW_ORDER: 'You have new order',
  TRUCK_ORDER_ACCEPT: 'You accepted a new order',
  FIND_NEW_TRUCK: 'Customer cancelled the order',
  TRUCK_CUSTOMER_EDIT_ORDER: 'Your order was edited',
  TRUCK_CANCELLED_ORDER_SUCCESS: 'You cancelled the order',
  CUSTOMER_CANCELLED_ORDER: 'Customer cancelled the order',
  TRUCK_ASSIGNED_SUCCESS: 'The order was assigned',
  REMIND_BEFORE_PICKUP: 'Just start you order!',
  TRUCK_DRIVER_ON_THE_WAY: 'Order is on pickup',
  TRUCK_PICKUP_ARRIVED: 'Driver arrived pickup point',
  ENTER_PICKUP_CODE: 'Pickup code was updated',
  TRUCK_PICKUP_SUCCESSFULLY: 'Order was picked up',
  TRUCK_ORDER_ARRIVED: 'Driver arrived destination',
  ENTER_DELIVERY_CODE: 'Delivery code was updated',
  TRUCK_ORDER_COMPLETE: 'Order was completed',
  FAVORITE_TRUCK: 'You are Favorite-Truck-operator',
  CUSTOMER_PAYMENT_DONE: 'Customer set Payment done',
  TRUCK_SELF_PAYMENT_DONE: 'Truck Onwer set Payment done',
  ADJUST_FARE: 'Additional fare is added successfully',
  CUSTOMER_ADJUST_FARE: 'Customer adjusted fare',
  LIMIT_ORDER: 'Your maximum order quantity is running out',
};

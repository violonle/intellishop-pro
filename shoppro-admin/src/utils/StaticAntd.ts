import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';

let message: MessageInstance;
let notification: NotificationInstance;
let modal: ModalStaticFunctions;

export default {
    get message() {
        return message;
    },
    set message(m: MessageInstance) {
        message = m;
    },
    get notification() {
        return notification;
    },
    set notification(n: NotificationInstance) {
        notification = n;
    },
    get modal() {
        return modal;
    },
    set modal(m: any) {
        modal = m;
    }
};

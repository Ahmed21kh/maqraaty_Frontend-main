import { APP_INITIALIZER } from '@angular/core';
import { WhatsappSocketService } from '../whatsapp/whatsapp-socket.service';

export const WhatsappInitializerProvider = {
  provide: APP_INITIALIZER,
  useFactory: (whatsappSocketService: WhatsappSocketService) => () => {
    return whatsappSocketService.connect();
  },
  deps: [WhatsappSocketService],
  multi: true,
};

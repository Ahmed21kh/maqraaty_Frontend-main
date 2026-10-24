import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';
import { WhatsappSocketService } from '../../core/whatsapp/whatsapp-socket.service';

/** Content of the "log in to WhatsApp" modal: QR code → progress → connected / error. */
@Component({
  selector: 'app-whatsapp-dialog',
  standalone: true,
  imports: [NzButtonModule, NzIconModule, NzQRCodeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-4 p-4 pb-5" aria-live="polite">
      @if (wa.connectionError()) {
        <div class="flex flex-col items-center justify-center gap-2">
          <span nz-icon nzType="warning" nzTheme="fill" class="!text-[80px] !text-app-danger"></span>
          <span class="text-base font-semibold">هناك مشكلة في الاتصال !</span>
          <span class="text-app-muted">{{ wa.connectionError() }}</span>
        </div>
      } @else if (wa.isReady()) {
        <span nz-icon nzType="check-circle" nzTheme="fill" class="!text-[80px] !text-app-whatsapp"></span>
        <span class="text-base font-semibold">الواتس جاهز لارسال الرسائل</span>
        <button
          nz-button
          (click)="wa.logout()"
          [nzLoading]="wa.loadingLogout()"
          class="!flex !w-[200px] !items-center !justify-center !rounded-lg !border-0 !bg-app-whatsapp !font-medium !text-[#1D1F1F]"
        >
          تسجيل الخروج
        </button>
      } @else if (wa.loading()) {
        <span nz-icon nzType="sync" [nzSpin]="true" class="!text-[80px] !text-app-whatsapp"></span>
        <span>جاري تسجيل الدخول ... {{ wa.count() }}%</span>
      } @else if (!wa.qrValue()) {
        <div class="flex flex-col items-center gap-4 py-8">
          <span nz-icon nzType="loading" class="!text-[56px] !text-app-whatsapp"></span>
          <span class="text-base font-semibold">جاري تجهيز رمز QR ...</span>
          <span class="text-sm text-app-muted">قد يستغرق ذلك بضع ثوان</span>
        </div>
      } @else {
        <div class="flex flex-col items-center gap-5 p-2">
          <nz-qrcode
            [nzValue]="wa.qrValue()!"
            nzIcon="assets/whatsapp.svg"
            [nzSize]="200"
            [nzStatus]="wa.loadingQr() ? 'loading' : 'active'"
            [nzLevel]="'L'"
            class="!rounded-lg"
          />
          <ol class="flex list-decimal flex-col gap-2 px-3 ps-6">
            <li>قم بفتح الواتس من هاتفك .</li>
            <li>توجه للاجهزة المرتبطة ثم اضغط علي اضافة جهاز .</li>
            <li>قم بعمل اسكان لل QR كود .</li>
          </ol>
        </div>
      }
    </div>
  `,
})
export class WhatsappDialogComponent {
  protected readonly wa = inject(WhatsappSocketService);
}

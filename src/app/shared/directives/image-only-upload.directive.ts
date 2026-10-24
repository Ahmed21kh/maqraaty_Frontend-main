import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadComponent, NzUploadFile } from 'ng-zorro-antd/upload';

/** Largest accepted photo. Student photos are shown as small avatars, so this is generous. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/**
 * Makes every `<nz-upload>` it is imported next to a single-photo upload:
 *  - the file picker is limited to image types (`accept`);
 *  - only one image is kept — choosing another replaces the previous one;
 *  - anything that is not an image, or is above 2 MB, is dropped before upload with an Arabic message;
 *  - a small hint under the control tells the user the allowed formats and size.
 *
 * Add `ImageOnlyUploadDirective` to a component's `imports` and all its uploads are covered.
 */
@Directive({ selector: 'nz-upload', standalone: true })
export class ImageOnlyUploadDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const host = inject(NzUploadComponent, { host: true });
    const message = inject(NzMessageService);

    host.nzAccept = ALLOWED_TYPES.join(',');
    host.nzMultiple = false;
    host.nzFilter = [
      ...(host.nzFilter ?? []),
      {
        name: 'image-only',
        fn: (files: NzUploadFile[]) => {
          const valid = files.filter((file) => {
            if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
              message.error('يسمح برفع الصور فقط (PNG أو JPG أو WEBP)');
              return false;
            }
            if ((file.size ?? 0) > MAX_IMAGE_BYTES) {
              message.error(`حجم الصورة كبير، الحد الأقصى ${MAX_IMAGE_BYTES / 1024 / 1024} ميجا`);
              return false;
            }
            return true;
          });
          // One image only: keep the last valid pick and drop the previously listed one
          // (nzLimit alone only trims a multi-file selection, it does not replace an earlier upload).
          const next = valid.slice(-1);
          if (next.length) host.nzFileList = [];
          return next;
        },
      },
    ];
  }

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const parent = host.parentNode;
    if (!parent) return;

    const hint = this.renderer.createElement('small') as HTMLElement;
    this.renderer.addClass(hint, 'upload-hint');
    this.renderer.setProperty(
      hint,
      'textContent',
      `صورة واحدة فقط — الحد الأقصى ${MAX_IMAGE_BYTES / 1024 / 1024} ميجا — الصيغ المسموحة: PNG, JPG, WEBP`
    );
    // Sits right under the upload control, whatever the surrounding markup is.
    this.renderer.insertBefore(parent, hint, host.nextSibling);
    this.destroyRef.onDestroy(() => hint.remove());
  }
}

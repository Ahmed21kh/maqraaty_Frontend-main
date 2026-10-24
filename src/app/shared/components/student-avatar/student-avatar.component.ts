import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FILES_URL } from '../../../core/config/api.config';
import { getInitials } from '../../../core/utils/student.mapper';

/** Round avatar: the uploaded photo, or coloured initials when there is none / it fails to load. */
@Component({
  selector: 'app-student-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src() && !failed()) {
      <img
        [src]="src()"
        [alt]="name()"
        [width]="size()"
        [height]="size()"
        loading="lazy"
        decoding="async"
        class="shrink-0 rounded-full object-cover"
        [style.width.px]="size()"
        [style.height.px]="size()"
        (error)="failed.set(true)"
      />
    } @else {
      <span
        class="flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [style.font-size.px]="size() * 0.38"
        [style.background]="color()"
        [attr.aria-label]="name()"
        role="img"
      >{{ initials() }}</span>
    }
  `,
})
export class StudentAvatarComponent {
  private readonly filesUrl = inject(FILES_URL);

  readonly name = input('');
  /** Path returned by the API (`student.image`), relative to the files origin. */
  readonly image = input<string | null | undefined>(null);
  readonly size = input(40);

  protected readonly failed = signal(false);
  protected readonly src = computed(() => {
    const path = this.image();
    return path ? `${this.filesUrl}${path}` : null;
  });
  protected readonly initials = computed(() => getInitials(this.name()));
  protected readonly color = computed(() => {
    // Stable hue per name so the same student always gets the same colour.
    let hash = 0;
    for (const ch of this.name()) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
    return `hsl(${hash} 55% 45%)`;
  });
}

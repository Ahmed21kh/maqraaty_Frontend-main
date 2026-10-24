import { inject, Pipe, PipeTransform } from '@angular/core';
import { FILES_URL } from '../../core/config/api.config';

/** `student.image | imageUrl` → absolute URL on the files origin (or null when there is no image). */
@Pipe({ name: 'imageUrl', standalone: true })
export class ImageUrlPipe implements PipeTransform {
  private readonly base = inject(FILES_URL);

  transform(path: string | null | undefined): string | null {
    return path ? `${this.base}${path}` : null;
  }
}

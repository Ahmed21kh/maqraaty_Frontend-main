import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { IconDefinition } from '@ant-design/icons-angular';
import {
  ArrowLeftOutline, AuditOutline, BellOutline, CalendarOutline, CaretDownFill, CaretUpFill,
  CheckCircleFill, CheckCircleOutline, CheckOutline, ClockCircleOutline, CloseCircleFill,
  CloseCircleOutline, CloseOutline, DeleteOutline, DollarOutline, DoubleLeftOutline,
  DoubleRightOutline, DownOutline, DownloadOutline, EditOutline, EllipsisOutline,
  ExclamationCircleFill, ExclamationCircleOutline, EyeOutline, FileOutline, FilterFill,
  HomeOutline, InboxOutline, InfoCircleFill, InfoCircleOutline, LeftOutline, LoadingOutline,
  LogoutOutline, MenuFoldOutline, MenuOutline, MenuUnfoldOutline, MinusOutline, PaperClipOutline,
  PhoneOutline, PictureOutline, PieChartOutline, PlusCircleOutline, PlusOutline,
  QuestionCircleOutline, ReloadOutline, RightOutline, RotateLeftOutline, RotateRightOutline,
  SearchOutline, SendOutline, StrikethroughOutline, SwapOutline, SyncOutline, TeamOutline,
  UpOutline, UploadOutline, UserAddOutline, UserDeleteOutline, UserOutline,
  UsergroupAddOutline, UsergroupDeleteOutline, WarningFill, WarningOutline, ZoomInOutline,
  ZoomOutOutline, CreditCardOutline, SettingOutline, BgColorsOutline, FontSizeOutline, LayoutOutline, VerticalAlignTopOutline, AccountBookOutline,
} from '@ant-design/icons-angular/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Only the icons the app (and the ng-zorro components it uses) actually render.
 *
 * Importing the whole `@ant-design/icons-angular/icons` barrel registers ~790 SVGs
 * in the main bundle. Anything not listed here is still resolved on demand from
 * `/assets/{outline,fill,twotone}` (copied by angular.json), so a missing entry
 * costs one small request instead of a broken icon.
 */
const icons: IconDefinition[] = [
  // app + layout
  HomeOutline, TeamOutline, UserAddOutline, UserDeleteOutline, UserOutline, UsergroupAddOutline,
  UsergroupDeleteOutline, DollarOutline, AuditOutline, StrikethroughOutline, PieChartOutline,
  MenuFoldOutline, MenuUnfoldOutline, MenuOutline, BellOutline, SearchOutline, ArrowLeftOutline,
  PlusOutline, MinusOutline, PlusCircleOutline, EditOutline, DeleteOutline, UploadOutline,
  InboxOutline, SyncOutline, ReloadOutline, SendOutline, PhoneOutline, LogoutOutline, CalendarOutline,
  WarningOutline, WarningFill, InfoCircleOutline, CheckCircleFill, CloseCircleOutline,
  // used internally by ng-zorro (select, picker, table, pagination, upload, image, modal, message)
  LoadingOutline, CloseOutline, CloseCircleFill, CheckCircleOutline, CheckOutline, InfoCircleFill,
  ExclamationCircleFill, ExclamationCircleOutline, QuestionCircleOutline, DownOutline, UpOutline,
  LeftOutline, RightOutline, DoubleLeftOutline, DoubleRightOutline, EllipsisOutline,
  ClockCircleOutline, FilterFill, CaretUpFill, CaretDownFill, EyeOutline, DownloadOutline,
  PaperClipOutline, FileOutline, PictureOutline, RotateLeftOutline, RotateRightOutline,
  ZoomInOutline, ZoomOutOutline, SwapOutline,
  // settings page + back-to-top button
  CreditCardOutline, SettingOutline, BgColorsOutline, FontSizeOutline, LayoutOutline, VerticalAlignTopOutline, AccountBookOutline,
];

export function provideNzIcons(): EnvironmentProviders {
  return importProvidersFrom(NzIconModule.forRoot(icons));
}

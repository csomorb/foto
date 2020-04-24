import { ItemModel } from './item.model';

export interface PhotoModel extends ItemModel{
  src150x150: string;
  src320x240: string;
  src640x480: string;
  src1280x720: string;
  src1920x1080: string;
  srcOrig: string;
}

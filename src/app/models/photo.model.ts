import { ItemModel } from './item.model';
import { FaceModel } from './face.model';

export interface PhotoModel extends ItemModel{
  idPhoto: number;
  src150: string;
  src320?: string;
  src640?: string;
  src1280?: string;
  src1920?: string;
  srcOrig: string;
  lat?: number;
  long?: number;
  alti?: number;
  facesToTag: Array<any>;
  faces: Array<FaceModel>;
}

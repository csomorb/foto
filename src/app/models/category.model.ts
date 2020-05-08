import { VideoModel } from './video.model';
import { PhotoModel } from './photo.model';

export interface CategoryModel {
  title: string;
  descr?: string;
  coverPhoto?: PhotoModel;
  listItem?: Array<PhotoModel|VideoModel>;
}

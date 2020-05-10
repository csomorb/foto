import { VideoModel } from './video.model';
import { PhotoModel } from './photo.model';

export interface CategoryModel {
  title: string;
  description?: string;
  coverPhoto?: PhotoModel;
  photos?: Array<PhotoModel>;
  videos?: Array<VideoModel>;
}

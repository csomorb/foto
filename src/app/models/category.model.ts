import { VideoModel } from './video.model';
import { PhotoModel } from './photo.model';

export interface CategoryModel {
  id:number;
  title: string;
  description?: string;
  coverPhoto?: PhotoModel;
  photos?: Array<PhotoModel>;
  videos?: Array<VideoModel>;
}

import { VideoModel } from './video.model';
import { PhotoModel } from './photo.model';

export interface CategoryModel {
  title: string;
  descr: string;
  idCover: number; //Ou src? Si src que format / petit grand? les deux
  listItem: Array<PhotoModel|VideoModel>;
}

import { CategoryModel } from './category.model';

export interface AlbumModel extends CategoryModel{
  listAlbum?: Array<AlbumModel>;

}

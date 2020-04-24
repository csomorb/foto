import { CategoryModel } from './category.model';
import { AlbumModel } from './album.model';

export interface PeopleModel extends CategoryModel{
  listAlbum: Array<AlbumModel>;
  dateOfBirth?: Date;
}

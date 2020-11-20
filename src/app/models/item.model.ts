import { TagModel } from './tag.model';
import { PeopleModel } from './people.model';
import { AlbumModel } from './album.model';

export interface ItemModel {
  title: string;
  description: string;
  weight: number;
  height: number;
  width: number;
  createAt: Date;
  updatedAt: Date;
  shootDate: Date;
  tags?: Array<TagModel>;
  peoples?: Array<PeopleModel>;
  albums?: Array<AlbumModel>;
}

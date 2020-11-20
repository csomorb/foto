import { CategoryModel } from './category.model';

export interface PeopleModel extends CategoryModel{
  birthDay?: Date;
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GalleryComponent } from 'src/app/components/gallery/gallery.component';
import { PeopleModel } from 'src/app/models/people.model';
import { ApiService } from 'src/app/services/api.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-peoplegallery',
  templateUrl: './peoplegallery.component.html',
  styleUrls: ['./../../../../components/gallery/gallery.component.css','./peoplegallery.component.css']
})
export class PeoplegalleryComponent extends GalleryComponent implements OnInit {

  people: PeopleModel;

  constructor(public router: Router, public catService: CategoryService, public apiService: ApiService,public toast: ToastrService,
    public route: ActivatedRoute) {
      super(router,catService,apiService,toast,route);
     }

  ngOnInit(): void {
    super.ngOnInit();
  }

  toEditMode(){
    super.toEditMode();
    this.people = this.catService.curCat;
  }

  toAddMode(){
    super.toAddMode();
    this.people = { id: 0, title: '', description: '', birthDay: new Date()};
  }

  toDeleteMode(){
    if (1){
      this.toast.warning('TODO',
        'TODO',
        {timeOut: 4000,});
    }
    else{
      this.deleteMode = true;
    }
  }

  createPeople(){
    if (this.people.title.length === 0 || !this.people.title.trim()){
      this.toast.error('Nom obligatoire',
          'Entrez un nom',
          {timeOut: 4000,});
    }
    else{
      this.apiService.postPeople(this.people.title, this.people.description, this.people.birthDay).subscribe(
        {
          next: data => {
            if (this.catService.curCat.id === 0){
              this.catService.curCat.listPeople.push(data);
            }
            console.log(data);
            const peopleName = data.title;
            this.addMode = false;
            this.toast.success(peopleName,
              'Ajouté',
              {timeOut: 3000,});
          },
          error: error => {
            console.error('There was an error in creating people!', error);
            this.toast.error('Détails: '+error.error.error,
            'Echec de la création',
            {timeOut: 4000,});
          }
      });
    }

  }

  deletePeople(){
    this.apiService.deletePeople(this.catService.curCat).subscribe(
      {
        next: data => {
          const peopleName = this.catService.curCat.title;
          this.router.navigateByUrl("peoples/");
          this.deleteMode = false;
          this.toast.success(peopleName,
            'Supprimé',
            {timeOut: 3000,});
        },
        error: error => {
          console.error('There was an error in delete!', error);
          this.toast.error('Détails: '+error.error,
          'Echec de la suppression',
          {timeOut: 4000,});
        }
    });
  }

  updatePeople(){
    this.apiService.updatePeople(this.people).subscribe({
        next: people => {
          this.editMode = false;
          this.toast.success(people.title + ' a été mise à jour',
            'Mise à jour',
            {timeOut: 3000,});
        },
        error: error => {
          this.toast.error('Détails: '+error.statusText,
          'Echec de la mise à jour',
          {timeOut: 4000,});
          console.error('There was an error in update!', error);
        }
    });
  }



}

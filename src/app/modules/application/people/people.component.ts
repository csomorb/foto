import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router,
    public catService: CategoryService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = parseInt(params.get('idPeople'));
      if (id){
        this.catService.loadPeople(id);
      }
      else{
        this.catService.loadRootPeople();
      }
    });
  }

}

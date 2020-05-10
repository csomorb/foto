import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';
import { LoginComponent } from './modules/general/login/login.component';
import { AlbumComponent } from './modules/application/album/album.component';
import { HomeComponent } from './modules/general/home/home.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { PhotoComponent } from './components/photo/photo.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'albums', component: AlbumComponent },
  { path: 'albums/:idAlbum', component: AlbumComponent ,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'gallery', component: GalleryComponent },
      { path: 'photos/:idPhoto', component: PhotoComponent }
      ]
  },
  { path: 'login', component: LoginComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Routes } from '@angular/router';
import { AddHelperComponent } from './add-helper/add-helper.component';
import { HelpersComponent } from './helpers/helpers.component';
import { UpdateHelperComponent } from './update-helper/update-helper.component';
export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./helpers/helpers.component').then(m => m.HelpersComponent)
    },
    {
        path: 'add-helper',
        loadComponent: () =>
            import('./add-helper/add-helper.component').then(m => m.AddHelperComponent)
    },
    {
        path: 'edit-helper/:helperID',
        loadComponent: () =>
            import('./update-helper/update-helper.component').then(m => m.UpdateHelperComponent)
    }
];
// Copyright (c) 2016 Chef Software Inc. and/or applicable contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {FormControl} from "@angular/forms";
import {Component, OnInit, OnDestroy} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {AppStore} from "../AppStore";
import {PackageBreadcrumbsComponent} from "../PackageBreadcrumbsComponent";
import {SpinnerComponent} from "../SpinnerComponent";
import {filterPackagesBy, setPackagesSearchQuery} from "../actions/index";
import {requireSignIn} from "../util";
import {PackagesListComponent} from "../packages-list/PackagesListComponent";
import {Subscription} from "rxjs/Subscription";

@Component({
    directives: [PackageBreadcrumbsComponent, SpinnerComponent, PackagesListComponent],
    template: `
    <div class="hab-packages">
        <div class="page-title">
            <h2>Search Packages</h2>
            <h4>
                <span *ngIf="searchQuery || query">Search Results</span>
                <package-breadcrumbs
                    *ngIf="!searchQuery"
                    [ident]="packageParams()">
                </package-breadcrumbs>
            </h4>
            <hab-spinner [isSpinning]="ui.loading" [onClick]="spinnerFetchPackages">
            </hab-spinner>
        </div>
        <div class="page-body">
            <input type="search" autofocus
                [formControl]="searchBox"
                placeholder="Search Packages&hellip;">

            <hab-packages-list
                [noPackages]="(!ui.exists || packages.size === 0) && !ui.loading"
                [packages]="packages"
                [errorMessage]="ui.errorMessage"></hab-packages-list>

            <div *ngIf="packages.size < totalCount">
                Showing {{packages.size}} of {{totalCount}} packages.
                <a href="#" (click)="fetchMorePackages()">
                    Load
                    {{(totalCount - packages.size) > perPage ? perPage : totalCount - packages.size }}
                    more</a>.
            </div>
        </div>
    </div>`,
})

export class PackagesPageComponent implements OnInit, OnDestroy {
    private perPage: number = 50;
    private searchBox: FormControl;
    private spinnerFetchPackages: Function;
    private name: string;
    private origin: string;
    private version: string;
    private query: string;
    private sub: Subscription;

    constructor(private store: AppStore, private route: ActivatedRoute) {
        this.spinnerFetchPackages = this.fetchPackages.bind(this);
        this.sub = route.params.subscribe(params => {
            this.name = params["name"];
            this.origin = params["origin"];
            this.version = params["version"];
            this.query = params["query"];
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    get packages() {
        return this.store.getState().packages.visible;
    }

    get searchQuery() {
        return this.store.getState().packages.searchQuery;
    }

    get totalCount() {
        return this.store.getState().packages.totalCount;
    }

    get ui() {
        return this.store.getState().packages.ui.visible;
    }

    public ngOnInit() {
        if (this.query) {
            this.search(this.query);
        } else {
            this.fetchPackages();
        }

        this.searchBox = new FormControl(this.searchQuery);

        this.searchBox.valueChanges.debounceTime(400).distinctUntilChanged().
            subscribe(query => this.search(query));
    }

    private packageParams() {
        return {
            name: this.name,
            origin: this.origin,
            version: this.version,
            query: this.query
        };
    }

    private fetchPackages() {
        this.store.dispatch(filterPackagesBy(this.packageParams(),
            this.searchQuery));
    }

    private fetchMorePackages() {
        this.store.dispatch(filterPackagesBy(this.route.params,
            this.searchQuery,
            this.store.getState().packages.nextRange));
        return false;
    }

    private search(query) {
        this.store.dispatch(setPackagesSearchQuery(query));
        this.fetchPackages();
        return false;
    }
}

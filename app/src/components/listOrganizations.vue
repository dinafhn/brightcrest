<template >
  <div id="container">
    <div class="row">
      <div class="card blue lighten-5 col m10 s12 offset-m1">
        <div class="card-content" >
          <div class="input-field col s6">

            <!--<vue-autocomplete
            name="orgName"
            url="http://localhost:8000/v1/organizations"
            anchor="orgName"
            label="label"
            model="keyword">
          </vue-autocomplete>
       
        <vue-autocomplete
        id="auto"
        name="orgName"
        placeholder="Type Here"
        url="http://localhost:8000/v1/organizations"
        param="q"
        limit="5"
        anchor="orgName"
        label="label"
        model="keyword">
      </vue-autocomplete>-->

      <div class="ui-widget">
        <label for="searchInput">Buscar: {{ keyword }}</label>


        <input id="searchInput" v-on:keyup="search(keyword)" type="text" v-model="keyword" placeholder="Buscar" >
      </div>
    </div>

    <div class="input-field col s6">

     <a class="waves-effect waves-light btn blue darken-4" title="Buscar..." v-on:click="search(keyword)" ><i class="large material-icons">search</i></a>


     <a class="waves-effect waves-light btn red darken-4" title="Limpiar Busqueda" v-on:click="cleansearch(message)">Limpiar Busqueda</a>
   </div>


   <div class="row"></div>
   <table> 
    <thead>
      <tr>
        <b>
          <div class="row">
            <div class="col s1">#</div>
            <div class="col s2">Logo</div>
            <div class="col s5">Nombre de ONG</div>
            <div class="col s2">Departamento</div>
            <div class="col s2">Acción</div>
          </div>
        </b>
            <!--
              <th data-field="number">#</th>
              <th data-field="logoUrl">Logo</th>
              <th data-field="orgName">Nombre de ONG</th>
              <th data-field="department">Departamento</th>
              <th data-field="action">Acción</th>
            -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="organization in filteredorganizations">

            <div class="row">
              <td><div class="col s1"><br>{{organization[0]}}</div>
                <div class="col s2"><img v-if="organization[1].logoUrl" v-link="{name: 'viewOrganization', params: {organizationId: organization[1]._id}}" class="list-logo" v-bind:src="organization[1].logoUrl" alt="" width="110" height="110" ></div>
                <div class="col s5"><br>{{organization[1].orgName}}</div>
                <div class="col s2"><br>{{organization[1].department}}</div>
                <div class="col s2"><br><a class="waves-effect waves-light btn green darken-4 col s4" title="Ver Organizacion" v-link="{name: 'viewOrganization', params: {organizationId: organization[1]._id}}"><i class="material-icons">pageview</i></a>
                  <a class="waves-effect waves-light btn blue darken-4 col s4" title="Editar Organizacion" v-if="checkPermissionEdit()" v-link="{name: 'editOrganization', params: {organizationId: organization[1]._id}}"><i class="material-icons">mode_edit</i></a>
                  <a class="waves-effect waves-light btn red darken-4 col s4" title="Eliminar Organizacion" v-if="checkPermissionDelete()" v-on:click="deleteOrganization(organization[1])"><i class="material-icons">delete</i></a></div>
                </td>
            <!--
             <td>{{organization[0]}}</td>
             <td><img v-if="organization[1].logoUrl" v-link="{name: 'viewOrganization', params: {organizationId: organization[1]._id}}" class="list-logo" v-bind:src="organization[1].logoUrl" alt="" width="110" height="110" ></td>

             <td>{{organization[1].orgName}}</td>
             <td>{{organization[1].department}}</td>
             
             <td>
              
                
              
            </td>
          -->
        </tr>
      </tbody>
    </table>

  </div>
  <div id="pagin" class="row col offset-s6 s6">
   <ul class="pagination" id="pagin">



   </ul>
 </div>
</div>




</div>


</template>

<script>
  var swal = require('sweetalert');
  var config = require('../../config.js');
  var Vue = require('vue');
  var vueAutocomplete = require('./vue-autocomplete.vue');
  var _ = require('lodash');
  
  // var $ = require('jquery');
  var list;

  module.exports = {

    name: 'listOrganizations',
    props: ['currentUser'],
    ready: function(){
      this.getScopes();
      $("html, body").animate({ scrollTop: 0 }, "slow");
      this.keyword = "";
      this.getOrganizations();
      $('#searchInput').autocomplete({
        lookup: this.keywords
      });
    },  

    data: function(){
      return {
            order : 1, //Control de sortBy
            listNumber: [],
            organizations: [],
            filteredorganizations: [],
            sourceorganizations: [],
            toSearch: [],
            list: [],
            keyword: {},
            allprojects: [],
            paginatedList: [],
            scopes: [],
            keywords: []
          }
        },
        components: {
          'vue-autocomplete': vueAutocomplete
        },

        methods: {
          getScopes: function(){
            this.$http.get(config.baseUrl() + '/v1/scopes').then(function(response){
              this.scopes=response.json();

            },function(error){
              console.log(error);
            });
          },
          checkPermissionEdit: function() {
            var userScope = window.sessionStorage.getItem('scope');
            var controlPermissions=null;
            
            for (var i = 0; i<this.scopes.length; i++) {
              if (userScope === this.scopes[i].scope) {
                controlPermissions = JSON.parse(this.scopes[i].views);
                break;
              }
            }
            if (controlPermissions) {
              if (controlPermissions.editOrganization==true) {
                return true;
              } else  {
                return false;
              }}else return false;

            },
            checkPermissionDelete: function() {
              var userScope = window.sessionStorage.getItem('scope');
              var controlPermissions=null;
              
              for (var i = 0; i<this.scopes.length; i++) {
                if (userScope === this.scopes[i].scope) {
                  controlPermissions = JSON.parse(this.scopes[i].views);
                  break;
                }
              }
              if (controlPermissions) {
                if (controlPermissions.deleteOrganization==true) {
                  return true;
                } else  {
                  return false;
                }
              }else return false;

            },
            createLog: function (action) {
              var log={
                action: action,
                timestamp: new Date().toString(),
                userId: this.currentUser.username
              };
              console.log(this.currentUser);
              console.log(log);

              this.$http.post(config.baseUrl() + '/v1/createLog', log).then(function(response){
                console.log("huh?");
                console.log(response.body.message);
              }, function(error){
                console.log(":(")
                console.log(error.body.message);
              });

            },
            initPagin: function(index){

             this.makepagList(this.sourceorganizations);
          //  console.log(this.makepagList);
           // console.log("works");
           this.renderPagin(index);
          /*
           var element = $("#pagin ul").append('<li class="waves-effect"><a v-on:click="controlPagin(\'s\')"><i class="material-icons">chevron_left</i></a></li>');
           $("#pagin ul").append('<li id="pagin1" class="active blue darken-4"><a v-on:click="controlPagin('+'1'+')">1</a></li>');

           for (var i = 0; i <= this.organizations.length; i=i+15) {
            if (i>this.organizations.length) {
              i=i>this.organizations.length;
            }
            this.paginatedList.push(this.organizations.slice(i,i+15));
            console.log(this.paginatedList[this.paginatedList.length-1]);
          }
          this.filteredorganizations=this.paginatedList[0];
          for (var i = 2; i <= Math.round(this.organizations.length/15); i++) {

            element = $("#pagin ul").append('<li class="waves-effect" "><a v-on:click="controlPagin('+i+')">'+i+'</a></li>');



            console.log(this.$compile(element.get(0)))
            
          }
          $("#pagin ul").append('<li class="waves-effect"><a v-on:click="controlPagin(\'e\')"><i class="material-icons">chevron_right</i></a></li>');
          this.$compile(element.get(0));
          */
        },
        controlPagin: function(index){
          if (!isNaN(index)) {
            $("#pagin ul").empty();
            this.renderPagin(index-1);
          }
        },

        makepagList: function(array){
          this.paginatedList=[];
          for (var i = 0; i <= array.length; i=i+15) {
            if (i>array.length) {
              i=i>array.length;
            }
            this.paginatedList.push(array.slice(i,i+15));

          }
        },

        uniq: function(a) {
          var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

          return a.filter(function(item) {
            var type = typeof item;
            if(type in prims)
              return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
            else
              return objs.indexOf(item) >= 0 ? false : objs.push(item);
          });
        },

        renderPagin: function(index){
          $("#pagin ul").empty();
          var element = $("#pagin ul").append('<li class="waves-effect"><a v-on:click="controlPagin(\'s\')"><i class="material-icons">chevron_left</i></a></li>');


          this.filteredorganizations=this.paginatedList[index];

          for (var i = 1; i <= this.paginatedList.length; i++) {
            if (index==i-1) {
              $("#pagin ul").append('<li id="pagin1" class="active blue darken-4"><a v-on:click="controlPagin('+'i'+')">'+i+'</a></li>');
            } else{
              element = $("#pagin ul").append('<li class="waves-effect" "><a v-on:click="controlPagin('+i+')">'+i+'</a></li>');
            }


           // console.log(this.$compile(element.get(0)))

         }
         $("#pagin ul").append('<li class="waves-effect"><a v-on:click="controlPagin(\'e\')"><i class="material-icons">chevron_right</i></a></li>');
         this.$compile(element.get(0));

       },
       cleansearch: function(){
        this.keyword="";

        this.popsource(this.organizations);
        this.initPagin(0);

      },

      search: function() {
        var searchKeyword = this.keyword.trim();
        
        this.toSearch=[];
        var orgwhile  = [];
        for (var i = 0; i < this.organizations.length; i++) {
          this.toSearch.push([this.organizations[i]._id, this.accent_fold(this.organizations[i].orgName.toLowerCase()), this.organizations[i].orgNumber, this.organizations[i].acronym ? this.organizations[i].acronym.toLowerCase() : '', 
            this.organizations[i].postal ? this.organizations[i].postal.toLowerCase() : '' , this.organizations[i].department ? this.accent_fold(this.organizations[i].department.toLowerCase()) : '',
            this.organizations[i].municipality ? this.organizations[i].municipality.toLowerCase() : '', this.organizations[i].village ? this.organizations[i].village.toLowerCase() : '', 
            this.organizations[i].community ? this.organizations[i].community.toLowerCase() : '', 
            this.organizations[i].sector ? this.organizations[i].sector.toLowerCase() : '', this.organizations[i].market ? this.organizations[i].market.toLowerCase() : '',this.organizations[i]]);
          for (var k = 0; k < this.organizations[i].orgName.split(" ").length; k++) {
            this.toSearch[this.toSearch.length-1].push(this.organizations[i].orgName.split(" ")[k]);
            this.toSearch[this.toSearch.length-1].push(this.organizations[i].orgName.toLowerCase().split(" ")[k]);
          }
          if (this.organizations[i].market!=null) {
            for (var k = 0; k < this.organizations[i].market.split(" ").length; k++) {
              this.toSearch[this.toSearch.length-1].push(this.organizations[i].market.split(" ")[k]);
              this.toSearch[this.toSearch.length-1].push(this.organizations[i].market.toLowerCase().split(" ")[k]);
            }}
            for (var j = 0; j < this.allprojects.length; j++) {
              if (this.allprojects[j].organizationId==this.organizations[i]._id) {
                this.toSearch[i].push(this.allprojects[j].name);
                this.toSearch[i].push(this.accent_fold(this.allprojects[j].name));
              }
            }
          }
          for (var i = 0; i < this.toSearch.length; i++) {
            for (var j = 0; j < this.toSearch[i].length; j++) {
              if (typeof this.toSearch[i][j] === 'string'   ) {
                if (this.toSearch[i][j].includes(this.accent_fold(searchKeyword)) || this.toSearch[i][j].includes(this.accent_fold(searchKeyword.toLowerCase()))) {
                  orgwhile.push(this.organizations[i]);
                }
              }
            }
          }

          this.popsource(this.uniq(orgwhile));
          this.initPagin(0);
          if (this.keyword == "") {
            this.popsource(this.organizations);
            this.initPagin(0);
          }


        },
        accent_fold: function(s) {
          var accentMap = {
            'á':'a', 'é':'e', 'í':'i','ó':'o','ú':'u'
          }
          if (!s) { return ''; }
          var ret = '';
          for (var i = 0; i < s.length; i++) {
            ret += accentMap[s.charAt(i)] || s.charAt(i);
          }
          return ret;
        },
        sortName: function () {
          this.organizations.sort(function(a, b){ 
            var nameA=a.orgName.toLowerCase(), nameB=b.orgName.toLowerCase()
            if (nameA < nameB) 
              return -1 
            if (nameA > nameB)
              return 1
            return 0 
          });
        },

        getOrganizations: function(){
          this.$http.get(config.baseUrl() + '/v1/projects').then(function(responsep){
            this.allprojects = responsep.json();

            this.$http.get(config.baseUrl() + '/v1/organizations').then(function(response){

              this.organizations = response.json();
              this.keywords = _.map(this.organizations, function(org){
                return org.orgName;
              });
              this.keywords.concat(_.map(this.organizations, function(org){
                return org.department;
              }));

              this.sortName();
                //this.filteredorganizations = this.organizations;
                this.popsource(this.organizations);
                this.initPagin(0);
              }, function(error){
                swal('Error', 'Error obteniendo las organizaciones del servidor', 'error');
              });
          }, function(errorp){
            swal('Error', 'Error obteniendo los projects del servidor', 'errorp');
          });
        },

        popsource: function(array) {
          this.sourceorganizations=[];
          for (var i = 1; i <= array.length; i++) {
            this.sourceorganizations.push([i,array[i-1]]);

          }
        },


        deleteOrganization: function(id){
          var component = this;
          swal({   
            title: "¿Está seguro?",   
            text: "¡Si eliminas esta organización, no se podrá recuperar!",   
            type: "warning",   
            showCancelButton: true,   
            confirmButtonColor: "#DD6B55",   
            confirmButtonText: "Si, eliminar",
            cancelButtonText: "No, cancelar",   
            closeOnConfirm: true 
          }, function(){
            component.$http.delete(config.baseUrl() + '/v1/organization/' + id._id).then(function(response){
              component.getOrganizations();
              this.cleansearch();
              swal.close();
              this.createLog("Eliminó la organización: "+id.orgName);
            },function(error){

            });

          });
        }
      }
    };

  </script>

  <style>
    .modal { width: 80% !important  }  /* increase the width as per you desire */
    #test .item{
      margin: 3px;
    }
    #test .item img{
      display: block;
      width: 100%;
      height: auto;
    }
    #container {
      overflow: scroll;
      height: 100%;
    }
    .list-logo {
      height: 80px;
    }
  </style>

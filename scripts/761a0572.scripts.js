"use strict";angular.module("digiviewApp",["ngRoute","ngAnimate"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/view/:sequenceNo",{templateUrl:"views/view.html",controller:"ViewCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("digiviewApp").controller("MainCtrl",["$scope","SolrService",function(a,b){a.$on("search-results-updated",function(){a.results=b.results,a.togglePageControls()}),a.nextPage=function(){a.results=!1,b.nextPage()},a.previousPage=function(){a.results=!1,b.previousPage()},a.togglePageControls=function(){a.disablePrevious=!0,a.disableNext=!0,a.disablePrevious=0===b.start?!0:!1,a.disableNext=b.start+b.rows>=a.results.totalGroups?!0:!1}}]),angular.module("digiviewApp").constant("Configuration",{production:"http://dcvw.esrc.info",testing:"http://dcvw.esrc.info",loglevel:"DEBUG",deployment:"testing",allowedRouteParams:[],site:"DCVW",searchType:"keyword",keywordSearchOperator:"AND",datasetStart:"2000-01-01T00:00:00Z",datasetEnd:"2014-12-31T23:59:59Z"}),angular.module("digiviewApp").factory("SolrService",["$rootScope","$http","$routeParams","$route","$location","$timeout","$window","LoggerService","Configuration",function a(b,c,d,e,f,g,h,i,j){function k(){i.init(j.loglevel),i.info("############"),i.info("############ APPLICATION INITIALISED"),i.info("############"),a.filters={},a.dateFilters={},a.results={},a.facets={},a.deployment=j[j.deployment],a.site=j.site,a.searchType=j.searchType,a.solr=a.deployment+"/"+a.site+"/select",i.debug("Solr Service: "+a.solr),i.debug("Site: "+a.site),F()>0&&sessionStorage.removeItem("cq");var c=a.loadData();void 0!==c&&c.site!==a.site&&sessionStorage.removeItem("cq");var c=a.loadData();return void 0!==c?m():n(),a.appInit=!1,g(function(){b.$broadcast("app-ready")},1e3),!0}function l(){var a=sessionStorage.getItem("cq");return angular.fromJson(b.$eval(a))}function m(){var b=a.loadData();a.appInit=!0,i.info("Initialising app from saved data"),a.q=b.q,a.filters=b.filters,a.dateFilters=b.dateFilters,a.term=b.term,a.searchType=b.searchType,a.sort=b.sort,a.start=b.start}function n(){a.appInit=!0,i.info("Bootstrapping app");var b=f.search();a.term=void 0!==b.q?b.q:"*",angular.forEach(b,function(b,c){if("q"!==c)if("object"==typeof b)for(var d=0;d<b.length;d++)a.filterQuery(c,b[d],!0);else a.filterQuery(c,b,!0)}),f.search({}).replace()}function o(b,c,d){var e,f=void 0===d?a.term:d;"keyword"===a.searchType?(f=f.replace(/ /gi," "+j.keywordSearchOperator+" "),e="title:("+f+")^20 OR text:("+f+")^10"):e='title:"'+f+'"^20 OR text:"'+f+'"^10',void 0!==c&&(e+=" AND group:"+c);var g=y().join(" AND ");return void 0===g&&(g=""),a.resultSort="score desc",e={url:a.solr,params:{q:e,start:b,rows:a.rows,wt:"json","json.wrf":"JSON_CALLBACK",fq:g,group:!0,"group.field":"group","group.sort":"page asc","group.ngroups":!0,hl:"true","hl.simple.pre":"<em>","hl.simple.post":"</em>"}},void 0!==c&&(e.params["group.limit"]=-1),a.q=e,a.q}function p(){var b={date:Date.now(),term:a.term,q:o(0),filters:a.filters,dateFilters:a.dateFilters,searchType:a.searchType,sort:a.sort,site:a.site,start:a.start};sessionStorage.setItem("cq",angular.toJson(b))}function q(d,e){if(void 0===d&&(d=0),f.path().match(/\/view\//)&&"*"!==a.term){var g=o(d,e,"*");c.jsonp(a.solr,g).then(function(f){r(f);var g=o(d,e);c.jsonp(a.solr,g).then(function(c){a.matches=c.data.highlighting,b.$broadcast("matches-available")})})}else{var g=o(d,e);i.debug("query: "),i.debug(g),c.jsonp(a.solr,g).then(function(b){r(b),void 0===a.matches})}}function r(c){if(void 0===c)a.results={term:a.term,total:0,items:[]};else{var d=[];angular.forEach(c.data.grouped.group.groups,function(a){d.push(a.doclist)}),a.results={term:a.term,totalGroups:c.data.grouped.group.ngroups,totalMatches:c.data.grouped.group.matches,start:parseInt(c.data.responseHeader.params.start),items:d,highlighting:c.data.highlighting},angular.forEach(a.results.items,function(b,c){a.results.items[c].sequenceNo=a.start+c+1})}v(),p(),b.$broadcast("search-results-updated")}function s(){var b=a.start-a.rows;a.start=b,(0>b||a.start<0)&&(a.start=0,b=0),q(b)}function t(){var b=a.start+a.rows;a.start=b,q(b)}function u(d,e,f){void 0===e&&(e=0),void 0===f&&(f=10);var g=o(0);g.params.facet=!0,g.params["facet.field"]=d,g.params["facet.limit"]=f,g.params["facet.sort"]="count",g.params["facet.offset"]=e,g.params.rows=0,c.jsonp(a.solr,g).then(function(c){angular.forEach(c.data.facet_counts.facet_fields,function(c,d){for(var e=[],f=0;f<c.length;f+=2)e.push([c[f],c[f+1],!1]);a.facets[d]=e,b.$broadcast(d+"-facets-updated")})})}function v(){angular.forEach(a.facets,function(b,c){a.updateFacetCount(c)}),b.$broadcast("update-date-facets")}function w(b,c,d){if(void 0===a.filters[b])a.filters[b]=[c];else if(-1===a.filters[b].indexOf(c))a.filters[b].push(c);else{var e=a.filters[b].indexOf(c);a.filters[b].splice(e,1),0===a.filters[b].length&&delete a.filters[b]}d!==!0&&(a.results.docs=[],a.results.start=0,q(0))}function x(b,c,d,e){var f,g,h,i;f=e.split(" - ")[0],g=e.split(" - ")[1],i=void 0!==c&&void 0!==d?c+"-"+d+"-"+e.replace(" - ","_"):b+"-"+e.replace(" - ","_"),a.dateFilters[i]?delete a.dateFilters[i]:(h={from:f+"-01-01T00:00:00Z",to:g+"-12-31T23:59:59Z",facetField:b,label:e,existenceFromField:c,existenceToField:d},a.dateFilters[i]=h),a.results.docs=[],a.results.start=0,q(0)}function y(){var b,c=[];for(b in a.filters){var d=a.filterUnion[b];c.push(b+':("'+a.filters[b].join('" '+d+' "')+'")')}var e=[];for(b in a.dateFilters){var f=a.dateFilters[b];if(void 0!==f.existenceFromField&&void 0!==f.existenceToField){var g,g="(exist_from:["+j.datasetStart+" TO "+f.to+"]";g+=" AND ",g+="exist_to:["+f.from+" TO "+j.datasetEnd+"])",e.push(g)}else{var g=f.facetField+":["+f.from+" TO "+f.to+"]";e.push(g)}}return c.length>0&&e.length>0?c=c.concat(["("+e.join(" OR ")+")"]):e.length>0&&(c=["("+e.join(" OR ")+")"]),c}function z(){a.filters={},a.dateFilters={},q(0),b.$broadcast("reset-all-filters")}function A(b){delete a.filters[b],q(0)}function B(){a.hideDetails=!a.hideDetails,b.$broadcast(a.hideDetails===!0?"hide-search-results-details":"show-search-results-details")}function C(){q(0)}function D(){var b={url:a.solr,params:{q:"*:*",start:0,rows:1,wt:"json","json.wrf":"JSON_CALLBACK",sort:"exist_from asc"}};c.jsonp(a.solr,b).then(function(b){a.dateStartBoundary=b.data.response.docs[0].exist_from;var d={url:a.solr,params:{q:"*:*",start:0,rows:1,wt:"json","json.wrf":"JSON_CALLBACK",sort:"exist_from desc"}};c.jsonp(a.solr,d).then(function(b){a.dateEndBoundary=b.data.response.docs[0].exist_to,a.compileDateFacets()})})}function E(d,e,f,g,h){b.$broadcast("reset-date-facets");var i;i=o(0),i.params.rows=0,i.params.facet=!0,i.params["facet.range"]=d,i.params["facet.range.start"]=f+"-01-01T00:00:00Z",i.params["facet.range.end"]=g+"-12-31T23:59:59Z",i.params["facet.range.gap"]="+"+h+"YEARS",c.jsonp(a.solr,i).then(function(c){var f,i,j=c.data.facet_counts.facet_ranges[d].counts;i=[];var k=(new Date).getFullYear();for(f=0;f<j.length;f+=2){var l=parseInt(j[f].split("-")[0])+parseInt(h)-1;l>g&&(l=g),l>k&&(l=k),i.push({rangeStart:parseInt(j[f].split("-")[0]),rangeEnd:l,count:j[f+1]})}var m=d+"_"+e;a.dateFacets[m]=i,b.$broadcast(m+"-facet-data-ready")})}var F=function(){var a=[];return angular.forEach(f.search(),function(b){a.push(b)}),a.length};b.$on("$routeUpdate",function(){if(!a.appInit)if(d.site!==a.site||F()>0)sessionStorage.removeItem("cq"),k(a.deployment,d.site);else{var b=sessionStorage.getItem("cq");null!==b?m(sessionStorage.getItem("cq")):k(a.deployment,d.site)}});var a={results:{},facets:{},dateFacets:{},filters:{},filterUnion:{},dateFilters:{},searchWhat:[],term:"*",rows:10,start:0,sort:void 0,resultSort:void 0,hideDetails:!1,init:k,loadData:l,search:q,saveData:r,previousPage:s,nextPage:t,updateFacetCount:u,filterQuery:w,getFilterObject:y,filterDateQuery:x,clearFilter:A,clearAllFilters:z,toggleDetails:B,reSort:C,dateOuterBounds:D,compileDateFacets:E};return a}]),angular.module("digiviewApp").service("LoggerService",["$log",function(a){return{logLevel:"ERROR",init:function(a){this.logLevel=a},log:function(b,c){a.log(b+": ",c)},debug:function(a){"DEBUG"===this.logLevel&&this.log("DEBUG",a)},info:function(a){("INFO"===this.logLevel||"DEBUG"==this.logLevel)&&this.log("INFO",a)},error:function(a){("ERROR"===this.logLevel||"INFO"===this.logLevel||"DEBUG"===this.logLevel)&&this.log("ERROR",a)}}}]),angular.module("digiviewApp").directive("searchBox",["SolrService",function(a){return{templateUrl:"views/search-box.html",restrict:"E",scope:{help:"@",searchType:"@"},link:function(b){b.$on("app-ready",function(){b.searchBox=a.term,a.search(a.start)}),b.setSearchBox=function(){b.searchBox="*"},b.search=function(){""===b.searchBox&&(b.searchBox="*"),a.term=b.searchBox,a.start=0,a.search(0)},b.setSearchBox(),b.ready=a.init()}}}]),angular.module("digiviewApp").directive("itemMatchList",["SolrService",function(a){return{templateUrl:"views/item-match-list.html",restrict:"E",link:function(b){b.$on("search-results-updated",function(){b.startAt=a.start+1,b.items=a.results.items})}}}]),angular.module("digiviewApp").directive("smoothzoom",["$rootScope","$window","$timeout","HighlightService",function(a,b,c,d){return{template:"",restrict:"A",link:function(b,c){b.init=function(){c.smoothZoom({animation_SPEED_ZOOM:.5,animation_SPEED_PAN:.5,animation_SMOOTHNESS:5,zoom_MAX:100,background_COLOR:"black",button_ALIGN:"top right",button_AUTO_HIDE:!0,button_SIZE:26,responsive:!0,on_ZOOM_PAN_START:function(){b.$apply(function(){a.$broadcast("ditch-highlights")})},on_ZOOM_PAN_COMPLETE:function(a){b.$apply(function(){d.storeCurrentTransformationAndPosition(a,c[0].getBoundingClientRect())})}})},b.$watch("image_pane_height",function(){c.smoothZoom("destroy"),b.init()}),c.on("load",function(){b.init()})}}}]),angular.module("digiviewApp").controller("ViewCtrl",[function(){}]),angular.module("digiviewApp").directive("viewSet",["$window","$location","$anchorScroll","$routeParams","$http","$timeout","HighlightService","SolrService",function(a,b,c,d,e,f,g,h){return{templateUrl:"views/view-set.html",restrict:"E",scope:{},link:function(i){i.smallImages=[],i.largeImageMap={},i.styleMap={},i.largeImageById=[],i.ready=!1,i.showFilmstrip=!1,i.showInformation=!1,i.showSpinner=!0;var j=angular.element(a);j.bind("resize",function(){i.$apply(function(){k(),i.loadImage(i.current)})});var k=function(){i.height=a.innerHeight,i.width=a.innerWidth,i.navbar_height=50,i.showFilmstrip===!0?(i.image_pane_height=.9*(a.innerHeight-i.navbar_height),i.filmstrip_height=a.innerHeight-i.navbar_height-i.image_pane_height,i.image_height=.8*i.filmstrip_height):i.image_pane_height=a.innerHeight-i.navbar_height};k(),i.$on("search-results-updated",function(){i.ready=!0,i.showSpinner=!1,i.data=h.results.items[0].docs,angular.forEach(i.data,function(a,b){i.smallImages.push({id:b,src:a.thumb_image}),i.styleMap[b]=""}),i.current=0,"*"===h.term&&i.loadImage()}),i.$on("matches-available",function(){if("*"!==h.results.term&&void 0!==h.matches){i.term=h.term,i.matchedWords=[],angular.forEach(h.matches,function(a){var b=a.text[0].match(/<em>(.*?)<\/em>/g);angular.forEach(b,function(a){a=a.replace(/<em>/,"").replace(/<\/em>/,""),-1===i.matchedWords.indexOf(a)&&i.matchedWords.push(a)})}),i.pageMatches=[];var a=_.pluck(i.data,"id");angular.forEach(h.matches,function(b,c){-1!==a.indexOf(c)&&i.pageMatches.push(a.indexOf(c)+1)}),i.current=i.pageMatches[0]-1,i.loadImage()}}),void 0===h.results.term?a.location="#/":(i.groupId=h.results.items[d.sequenceNo-h.start-1].docs[0].group,h.search(0,i.groupId)),i.getWords=function(a){e.get(a).then(function(a){var b=a.data.words;i.highlights=[],angular.forEach(i.matchedWords,function(a){void 0!==b[a]&&angular.forEach(b[a],function(b){var c={word:a,top:parseInt(b.top),bottom:parseInt(b.bottom),left:parseInt(b.left),right:parseInt(b.right)};i.highlights.push(c)})}),angular.forEach(i.matchedWords,function(a){void 0===b[a]&&angular.forEach(b,function(b,c){null!==c.match(a)&&angular.forEach(b,function(a){var b={word:c,top:parseInt(a.top),bottom:parseInt(a.bottom),left:parseInt(a.left),right:parseInt(a.right)};i.highlights.push(b)})})}),g.storeMatchedWordsAndHighlights(a.data.page,i.matchedWords,i.highlights)},function(){})},i.loadImage=function(){"*"!==h.term&&i.getWords(i.data[i.current].words),i.styleMap={};var a=i.current;i.image=i.data[a],i.styleMap[a]="highlight-current",i.show=!0;var d=b.hash();b.hash(i.current),c(),b.hash(d),1===i.data.length?(i.showNext=!1,i.showPrevious=!1):0===i.current&&i.data.length>1?(i.showNext=!0,i.showPrevious=!1):i.current===i.data.length-1&&i.data.length>1?(i.showNext=!1,i.showPrevious=!0):(i.showNext=!0,i.showPrevious=!0)},i.next=function(){i.current+=1,i.loadImage()},i.previous=function(){i.current-=1,i.loadImage()},i.jumpToStart=function(){i.current=0,i.loadImage()},i.jumpToEnd=function(){i.current=i.data.length-1,i.loadImage()},i.jumpToPage=function(a){i.current=a,i.loadImage(),i.showInformation&&i.toggleInformation()},i.toggleFilmstrip=function(){i.showFilmstrip=!i.showFilmstrip,k(),i.showFilmstrip&&f(function(){var a=b.hash();b.hash(i.current),c(),b.hash(a)},2e3)},i.toggleInformation=function(){i.showInformation=!i.showInformation}}}}]),angular.module("digiviewApp").service("HighlightService",["$rootScope",function(a){function b(b,c){d.transform=b,d.position=c,a.$broadcast("transform-updated")}function c(b,c,e){d.words=c,d.highlights=e,d.page=b,a.$broadcast("words-updated")}var d={storeCurrentTransformationAndPosition:b,storeMatchedWordsAndHighlights:c};return d}]),angular.module("digiviewApp").directive("highlighter",["$timeout","HighlightService",function(a,b){return{templateUrl:"views/highlighter.html",restrict:"E",scope:{},link:function(c){c.$on("words-updated",function(){c.wordsUpdated()}),c.$on("transform-updated",function(){c.transformUpdated()}),c.$on("ditch-highlights",function(){c.showHighlights=!1}),c.wordsUpdated=function(){c.showHighlights=!1,c.words=b.words,c.highlights=b.highlights,c.page=b.page,a(function(){c.update()},1e3)},c.transformUpdated=function(){c.showHighlights=!1,c.transform=b.transform,c.position=b.position,a(function(){c.update()},1e3)},c.update=function(){c.highlightBoxes=[],void 0!==c.transform&&void 0!==c.highlights&&angular.forEach(c.highlights,function(a){var b=c.transform.normHeight/c.page.height,d=c.transform.normWidth/c.page.width,e=a.top*b*c.transform.ratio,f=a.bottom*b*c.transform.ratio,g=a.left*d*c.transform.ratio,h=a.right*d*c.transform.ratio,i={position:"fixed","background-color":"yellow","z-index":5e3,opacity:.2,"border-radius":"8px",top:e-.015*e+c.position.top+"px",left:g-.015*g+c.position.left+"px",width:h-g+.03*h+"px",height:f-e+.03*f+"px"};c.highlightBoxes.push(i),c.showHighlights=!0})}}}}]),angular.module("digiviewApp").directive("spinner",function(){return{template:'<div id="spinner"></div>',restrict:"E",scope:{colour:"@"},link:function(a,b){var c;c=void 0===a.colour?"white":a.colour;var d={lines:15,length:30,width:5,radius:30,corners:1,rotate:0,direction:1,color:c,speed:1,trail:60,shadow:!1,hwaccel:!1,className:"spinner",zIndex:2e9,top:"50%",left:"50%"},e=new Spinner(d).spin();b[0].appendChild(e.el)}}});
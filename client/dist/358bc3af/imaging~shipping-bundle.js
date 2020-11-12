(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{1008:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"platetypeid",urlRoot:"/plates/types",dropTotal:function(){return this.get("drop_per_well_x")*this.get("drop_per_well_y")-(this.get("well_drop")>-1?1:0)},wellTotal:function(){return this.get("capacity")/this.dropTotal()},getWell:function(t){return Math.floor((parseInt(t)-1)/this.dropTotal())},getName:function(t){var e=this.getRowColDrop(t);return String.fromCharCode(e.row+65)+(e.col+1)},getDrop:function(t){return(t-1)%this.dropTotal()+1},getRowColDrop:function(t){var e=Math.floor((parseInt(t)-1)/this.dropTotal()),i=(t-1)%this.dropTotal()+1,n=e%this.get("well_per_row");return{row:Math.floor(e/this.get("well_per_row")),col:n,drop:i,pos:t}},calcParams:function(){this.set("well_pad",this.width/130),this.set("drop_pad",this.width/130),this.set("well_width",(this.width-this.get("offset_x"))/this.get("well_per_row")-this.get("well_pad")),this.set("well_height",(this.height-this.get("offset_y"))/(this.get("capacity")/(this.get("well_per_row")*this.dropTotal()))-this.get("well_pad")),this.set("drop_widthpx",(this.get("well_width")-2*this.get("drop_pad"))/(this.get("drop_per_well_x")/this.get("drop_width"))),this.set("drop_heightpx",(this.get("well_height")-2*this.get("drop_pad"))/(this.get("drop_per_well_y")/this.get("drop_height"))),this.set("drop_offset_x",this.get("drop_offset_x")*(this.get("well_width")-2*this.get("drop_pad"))),this.set("drop_offset_y",this.get("drop_offset_y")*(this.get("well_height")-2*this.get("drop_pad")))},setGeometry:function(t,e,i,n){this.width=t,this.height=e,this.set("offset_x",i||25),this.set("offset_y",n||25),this.calcParams()}})}.apply(e,n))||(t.exports=r)},1016:function(module,exports,__webpack_require__){var _=__webpack_require__(5);module.exports=function(obj){var __t,__p="",__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,"")};with(obj||{})__p+="\n    <h2>Screen Components</h2>\n\n    ",editable&&(__p+='\n    <div class="form">\n        <ul>\n            <li>\n                <span class="label">Add Component</span>\n                <input type="text" name="addcomp" />\n            </li>\n        </ul>\n    </div>\n    '),__p+='\n\n    <div class="table">\n\n        <table class="sccomponents">\n            <thead>\n                <tr>\n                    <th>Component</th>\n                    <th colspan="2">Concentration</th>\n                    <th>pH</th>\n                    <th>&nbsp;</th>\n                </tr>\n            </thead>\n            \n            <tbody></tbody>\n        </table>\n\n    </div>\n\n    ',canSave&&editable&&(__p+='\n    <div class="form">\n        <button name="submit" value="1" type="submit" class="button submit"><i class="fa fa-plus"></i> Add Group</button>\n    </div>\n    '),__p+="\n";return __p}},1017:function(module,exports,__webpack_require__){var _=__webpack_require__(5);module.exports=function(obj){var __t,__p="",__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,"")};with(obj||{})__p+='    <td class="COMPONENTID">'+(null==(__t=COMPONENT)?"":_.escape(__t))+"</td>\n    <td>"+(null==(__t=CONCENTRATION)?"":_.escape(__t))+"</td>\n    <td>"+(null==(__t=UNIT)?"":_.escape(__t))+'</td>\n    <td class="PH">'+(null==(__t=PH)?"":_.escape(__t))+"</td>\n    <td>\n    \t",editable&&(__p+='\n        <a class="button button-notext edit"><i class="fa fa-pencil"></i> <span>Edit</span></a>\n        <a class="button button-notext delete"><i class="fa fa-times"></i> <span>Delete</span></a>\n        '),__p+="\n    </td>\n";return __p}},1018:function(module,exports,__webpack_require__){var _=__webpack_require__(5);module.exports=function(obj){var __t,__p="",__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,"")};with(obj||{})__p+="\t<td>"+(null==(__t=COMPONENT)?"":_.escape(__t))+'</td>\n    <td><input type="text" name="CONCENTRATION"></td>\n    <td>'+(null==(__t=UNIT)?"":_.escape(__t))+"</td>\n    <td>",HASPH&&(__p+='<input type="text" name="PH">'),__p+="</td>\n    <td>\n    \t",canSave&&(__p+='\n        <a class="button button-notext save"><i class="fa fa-check"></i> <span>Save Component</span></a>\n        '),__p+='\n        <a class="button button-notext cancel"><i class="fa fa-times"></i> <span>Cancel</span></a>\n    </td>\n\n';return __p}},1019:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"IMAGERID",urlRoot:"/imaging/imager",validation:{NAME:{required:!0,pattern:"wwsdash"},CAPACITY:{required:!0,pattern:"number"},TEMPERATURE:{required:!0,pattern:"number"},SERIAL:{required:!0,pattern:"wwsdash"}}})}.apply(e,n))||(t.exports=r)},1056:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"INSPECTIONTYPEID",urlRoot:"/imaging/inspection/types",validation:{NAME:{required:!0,pattern:"word"}}})}.apply(e,n))||(t.exports=r)},170:function(t,e,i){(function(n){var r,a;r=[i(6),i(10),i(266)],void 0===(a=function(t,e,i){return e.extend({model:i,mode:"client",url:"/imaging/screen/components",state:{pageSize:15},save:function(e){e=n.extend({},e);var i=this,r=e.success;return e.success=function(t){i.reset(t),r&&r(i,t,e),i.trigger("sync",i,t,e)},t.sync("update",this,e)}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},173:function(t,e,i){(function(n){var r,a;r=[i(10),i(436),i(14)],void 0===(a=function(t,e,i){return t.extend(n.extend({},i,{model:e,mode:"server",url:"/imaging/inspection",keyAttribute:"TITLE",valueAttribute:"CONTAINERINSPECTIONID",state:{pageSize:15},parseState:function(t,e,i,n){return{totalRecords:t.total}},parseRecords:function(t,e){return t.data}}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))},174:function(t,e,i){(function(n){var r,a;r=[i(6)],void 0===(a=function(t){return t.Model.extend({idAttribute:"BEAMLINESETUPID",urlRoot:"/exp/setup",defaults:[],initialize:function(t,e){n.each(this.validation,(function(t,e){this.defaults[e]="word"==t.pattern||"wwsdash"==t.pattern||"wwdash"==t.pattern?"":null}),this)},map:{REQUIREDRESOLUTION:["DETECTORMAXRESOLUTION","DETECTORMINRESOLUTION"],EXPOSURETIME:["MINEXPOSURETIMEPERIMAGE","MAXEXPOSURETIMEPERIMAGE"],PREFERREDBEAMSIZEX:["BEAMSIZEXMIN","BEAMSIZEXMAX"],PREFERREDBEAMSIZEY:["BEAMSIZEYMIN","BEAMSIZEYMAX"],BOXSIZEX:["BOXSIZEXMIN","BOXSIZEXMAX"],BOXSIZEY:["BOXSIZEYMIN","BOXSIZEYMAX"],AXISRANGE:["GONIOSTATMINOSCILLATIONWIDTH","GONIOSTATMAXOSCILLATIONWIDTH"],AXISSTART:["OMEGAMIN","OMEGAMAX"],AXISEND:["OMEGAMIN","OMEGAMAX"],NUMBEROFIMAGES:["NUMBEROFIMAGESMIN","NUMBEROFIMAGESMAX"],TRANSMISSION:["MINTRANSMISSION","MAXTRANSMISSION"],ENERGY:["ENERGYMIN","ENERGYMAX"],DISTANCE:["DETECTORDISTANCEMIN","DETECTORDISTANCEMAX"],MONOBANDWIDTH:["MONOBANDWIDTHMIN","MONOBANDWIDTHMAX"],ROLL:["DETECTORROLLMIN","DETECTORROLLMAX"]},getRange:function(t){if(t&&t.field&&t.field in this.map){var e=this.map[t.field];if(null!==this.get(e[0])&&null!==this.get(e[1]))return[parseFloat(this.get(e[0])),parseFloat(this.get(e[1]))]}},validation:{BEAMLINENAME:{required:!0,pattern:"wwdash"},DETECTORID:{required:!0,pattern:"digits"},BEAMSIZEXMAX:{required:!1,pattern:"number"},BEAMSIZEXMIN:{required:!1,pattern:"number"},BEAMSIZEYMAX:{required:!1,pattern:"number"},BEAMSIZEYMIN:{required:!1,pattern:"number"},BOXSIZEXMAX:{required:!1,pattern:"number"},BOXSIZEXMIN:{required:!1,pattern:"number"},BOXSIZEYMAX:{required:!1,pattern:"number"},BOXSIZEYMIN:{required:!1,pattern:"number"},CS:{required:!1,pattern:"number"},ENERGYMAX:{required:!1,pattern:"digits"},ENERGYMIN:{required:!1,pattern:"digits"},GONIOSTATMAXOSCILLATIONWIDTH:{required:!1,pattern:"number"},GONIOSTATMINOSCILLATIONWIDTH:{required:!1,pattern:"number"},KAPPAMAX:{required:!1,pattern:"number"},KAPPAMIN:{required:!1,pattern:"number"},MAXEXPOSURETIMEPERIMAGE:{required:!1,pattern:"number"},MINEXPOSURETIMEPERIMAGE:{required:!1,pattern:"number"},MAXTRANSMISSION:{required:!1,pattern:"digits"},MINTRANSMISSION:{required:!1,pattern:"digits"},NUMBEROFIMAGESMAX:{required:!1,pattern:"digits"},NUMBEROFIMAGESMIN:{required:!1,pattern:"digits"},OMEGAMAX:{required:!1,pattern:"number"},OMEGAMIN:{required:!1,pattern:"number"},PHIMAX:{required:!1,pattern:"number"},PHIMIN:{required:!1,pattern:"number"},MONOBANDWIDTHMIN:{required:!1,pattern:"number"},MONOBANDWIDTHMAX:{required:!1,pattern:"number"}}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},263:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"SCHEDULEID",urlRoot:"/imaging/schedule",defaults:{CONTAINERS:0,SCHEDULECOMPONENTS:0},validation:{NAME:{required:!0,pattern:"wwsdash"}}})}.apply(e,n))||(t.exports=r)},264:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"SCREENID",urlRoot:"/imaging/screen",defaults:{COMPONENTS:0,GROUPS:0},validation:{NAME:{required:!0,pattern:"wwsdash"}}})}.apply(e,n))||(t.exports=r)},265:function(t,e,i){(function(n){var r,a;r=[i(6),i(10),i(431)],void 0===(a=function(t,e,i){return e.extend({model:i,mode:"client",url:"/imaging/screen/groups",state:{pageSize:15},initialize:function(t){this.on("change:isSelected",this.onSelectedChanged,this)},onSelectedChanged:function(t){this.each((function(t){!0!==t.get("isSelected")||t._changing||t.set({isSelected:!1})})),this.trigger("selected:change")},save:function(e){e=n.extend({},e);var i=this,r=e.success;return e.success=function(t){i.reset(t),r&&r(i,t,e),i.trigger("sync",i,t,e)},t.sync("update",this,e)}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},266:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"SCREENCOMPONENTID",urlRoot:"/imaging/screen/components",defaults:{CONCENTRATION:"",PH:"",canSave:!0},validation:{SCREENCOMPONENTGROUPID:{required:!0,pattern:"number"},COMPONENTID:{required:!0,pattern:"number"},CONCENTRATION:{required:!1,pattern:"number"},PH:{required:!1,pattern:"number"}}})}.apply(e,n))||(t.exports=r)},267:function(t,e,i){(function(n){var r,a;r=[i(7),i(6),i(12),i(49),i(11),i(71),i(170),i(266),i(20),i(1016),i(1017),i(1018),i(8)],void 0===(a=function(t,e,i,r,a,s,o,l,p,d,u,_,h){var c=r.extend({editable:!0,getTemplate:function(){return this.model.get("new")||this.model.get("edit")?_:u},templateHelpers:function(){return{editable:this.getOption("editable")}},events:{"click a.edit":"edit","click a.cancel":"cancel","click a.delete":"delete"},ui:{},setData:function(){var t={};n.each(["CONCENTRATION","PH"],(function(e){t[e]=h("[name="+e+"]").val()})),this.model.set(t)},success:function(){this.model.set({edit:!1}),this.model.set({new:!1}),this.render()},failure:function(){app.alert({message:"Something went wrong registering that component"})},edit:function(t){t.preventDefault(),this.model.set({edit:!0}),this.render()},cancel:function(t){t.preventDefault(),this.model.get("edit")?(this.model.set({edit:!1}),this.render()):this.model.collection.remove(this.model)},delete:function(t){t.preventDefault(),this.model.destroy()},onRender:function(){(this.model.get("edit")||this.model.get("new"))&&n.each(["CONCENTRATION","PH"],(function(t,e){this.model.get(t)&&this.$el.find("input[name="+t+"]").val(this.model.get(t))}),this)}}),E=r.extend({template:'<tr><td colspan="5">No components for this group</td></tr>'});return t.CompositeView.extend({editable:!0,template:d,childView:c,emptyView:E,childViewContainer:"tbody",childViewOptions:function(){return{editable:this.getOption("editable")}},templateHelpers:function(){return{canSave:!(this.model&&this.model.get("SCREENCOMPONENTGROUPID")>0),editable:this.getOption("editable")}},ui:{add:"input[name=addcomp]"},events:{"click button.submit":"saveGroup"},saveGroup:function(t){t.preventDefault(),console.log("submit"),this.model&&(console.log(this.model),this.model.save({},{success:this.onSave.bind(this),error:function(){app.alert({message:"Something went wrong registering the group"})}}))},onSave:function(t){this.model.set({new:!1}),this.collection.length?(this.collection.each((function(t,e){t.set("SCREENCOMPONENTGROUPID",this.model.get("SCREENCOMPONENTGROUPID"))}),this),this.components.save({success:this.onSaveCollection.bind(this),failure:function(){app.alert({message:"Something went wrong registering the group components"})}})):this.render()},onSaveCollection:function(){this.components.each((function(t,e){t.set({new:!1})})),this.render()},initialize:function(t){this.collection=new o,this.components=t&&t.components,this.listenTo(this.components,"add remove sync",this.selectComponents,this),this.componentlist=new s},onRender:function(){this.ui.add.autocomplete({source:this.getComponentList.bind(this),select:this.addComponent.bind(this)})},getComponentList:function(t,e){var i=this;this.componentlist.fetch({data:{term:t.term,global:1},success:function(t){e(i.componentlist.map((function(t){return{value:t.get("NAME")||t.get("ACRONYM"),id:t.get("PROTEINID")}})))}})},addComponent:function(t,e){t.preventDefault();var i=this.componentlist.findWhere({PROTEINID:e.item.id});i&&this.components.add(new l({SCREENCOMPONENTGROUPID:this.model.get("SCREENCOMPONENTGROUPID"),COMPONENTID:i.get("PROTEINID"),COMPONENT:i.get("NAME")||i.get("ACRONYM"),UNIT:i.get("UNIT"),HASPH:i.get("HASPH"),POSITION:this.model.get("POSITION"),new:!0,canSave:this.model.get("SCREENCOMPONENTGROUPID")>0})),this.ui.add.val("")},setModel:function(t){this.undelegateEvents(),this.model=t,this.delegateEvents(),this.selectComponents(),this.render()},selectComponents:function(){if(this.model)var t=this.components.where({POSITION:this.model.get("POSITION")});else t=[];this.collection.reset(t)}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},269:function(t,e,i){(function(n){var r,a;r=[i(10),i(1056),i(14)],void 0===(a=function(t,e,i){return t.extend(n.extend({},i,{model:e,mode:"client",url:"/imaging/inspection/types",keyAttribute:"NAME",valueAttribute:"INSPECTIONTYPEID",state:{pageSize:15}}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))},270:function(t,e,i){(function(n){var r,a;r=[i(6)],void 0===(a=function(t){return t.Model.extend({idAttribute:"DIFFRACTIONPLANID",urlRoot:"/sample/plan",defaults:[],initialize:function(t,e){n.each(this.validation,(function(t,e){this.defaults[e]="word"==t.pattern||"wwsdash"==t.pattern?"":null}),this)},validation:{COMMENTS:{required:!0,pattern:"wwsdash"},EXPERIMENTKIND:{required:!0,pattern:"word"},REQUIREDRESOLUTION:{required:!0,pattern:"number"},EXPOSURETIME:{required:!0,pattern:"number"},PREFERREDBEAMSIZEX:{required:!1,pattern:"number"},PREFERREDBEAMSIZEY:{required:!1,pattern:"number"},BOXSIZEX:{required:!1,pattern:"digits"},BOXSIZEY:{required:!1,pattern:"digits"},AXISRANGE:{required:!1,pattern:"number"},AXISSTART:{required:!1,pattern:"number"},NUMBEROFIMAGES:{required:!1,pattern:"digits"},TRANSMISSION:{required:!1,pattern:"number"},ENERGY:{required:!1,pattern:"digits"},MONOCHROMATOR:{required:!1,pattern:"word"},BEAMLINENAME:{required:!1,pattern:"wwdash"}}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},427:function(t,e,i){(function(n){var r,a;r=[i(10),i(263),i(14)],void 0===(a=function(t,e,i){return t.extend(n.extend({},i,{model:e,mode:"client",url:"/imaging/schedule",keyAttribute:"NAME",valueAttribute:"SCHEDULEID",state:{pageSize:100}}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))},428:function(t,e,i){var n,r;n=[i(10),i(429)],void 0===(r=function(t,e){return t.extend({model:e,mode:"client",url:"/imaging/schedule/components",defaults:{OFFSET_HOURS:0,INSPECTIONTYPID:1},state:{pageSize:100}})}.apply(e,n))||(t.exports=r)},429:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"SCHEDULECOMPONENTID",urlRoot:"/imaging/schedule/components",defaults:{OFFSET_HOURS:"",INSPECTIONTYPEID:0},validation:{SCHEDULEID:{required:!0,pattern:"number"},OFFSET_HOURS:{required:!0,pattern:"number"},INSPECTIONTYPEID:{required:!0,pattern:"number"}}})}.apply(e,n))||(t.exports=r)},430:function(t,e,i){(function(n){var r,a;r=[i(10),i(264),i(14)],void 0===(a=function(t,e,i){return t.extend(n.extend({},i,{model:e,mode:"client",url:"/imaging/screen",keyAttribute:"NAME",valueAttribute:"SCREENID",state:{pageSize:15}}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))},431:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"SCREENCOMPONENTGROUPID",urlRoot:"/imaging/screen/groups",validation:{SCREENID:{required:!0,pattern:"number"},POSITION:{required:!0,pattern:"number"}}})}.apply(e,n))||(t.exports=r)},432:function(t,e,i){(function(n){var r,a;r=[i(10),i(1019),i(14)],void 0===(a=function(t,e,i){return t.extend(n.extend({},i,{model:e,mode:"client",url:"/imaging/imager",keyAttribute:"NAME",valueAttribute:"IMAGERID",state:{pageSize:15}}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))},436:function(t,e,i){var n,r;n=[i(6)],void 0===(r=function(t){return t.Model.extend({idAttribute:"CONTAINERINSPECITONID",urlRoot:"/imaging/inspection",validation:{CONTAINERID:{required:!0,pattern:"number"},INSPECTIONTYPEID:{required:!0,pattern:"number"},TEMPERATURE:{required:!0,pattern:"number"},BLTIMESTAMP:{required:!0,pattern:"datetime"}}})}.apply(e,n))||(t.exports=r)},439:function(t,e,i){(function(n){var r,a;r=[i(10),i(270),i(14)],void 0===(a=function(t,e,i){return t.extend(n.extend({},i,{model:e,mode:"client",url:"/sample/plan",keyAttribute:"COMMENTS",valueAttribute:"DIFFRACTIONPLANID",state:{pageSize:15}}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))},440:function(module,exports,__webpack_require__){var _=__webpack_require__(5);module.exports=function(obj){var __t,__p="",__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,"")};with(obj||{})__p+='<table>\n\t<tr>\n\t\t<td class="renderable">Beam Size</td>\n\t\t<td class="renderable"><input type="text" name="PREFERREDBEAMSIZEX" value="'+(null==(__t=PREFERREDBEAMSIZEX)?"":_.escape(__t))+'" />x <input type="text" name="PREFERREDBEAMSIZEY"  value="'+(null==(__t=PREFERREDBEAMSIZEY)?"":_.escape(__t))+'" />y &micro;m</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">No. Images</td>\n\t\t<td class="renderable"><input type="text" name="NUMBEROFIMAGES" value="'+(null==(__t=NUMBEROFIMAGES)?"":_.escape(__t))+'" /></td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">&Omega; Start</td>\n\t\t<td class="renderable"><input type="text" name="AXISSTART" value="'+(null==(__t=AXISSTART)?"":_.escape(__t))+'" /> &deg;</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">&Omega; Range</td>\n\t\t<td class="renderable"><input type="text" name="AXISRANGE" value="'+(null==(__t=AXISRANGE)?"":_.escape(__t))+'" /> &deg;</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">&Omega; End</td>\n\t\t<td class="renderable"><input type="text" name="AXISEND" value="" disabled="disabled" /> &deg;</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Energy</td>\n\t\t<td class="renderable"><input type="text" name="ENERGY" value="'+(null==(__t=ENERGY)?"":_.escape(__t))+'" /> ev</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Transmission</td>\n\t\t<td class="renderable"><input type="text" name="TRANSMISSION" value="'+(null==(__t=TRANSMISSION)?"":_.escape(__t))+'" /> %</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Exposure</td>\n\t\t<td class="renderable"><input type="text" name="EXPOSURETIME" value="'+(null==(__t=EXPOSURETIME)?"":_.escape(__t))+'" /> s</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Resolution</td>\n\t\t<td class="renderable"><input type="text" name="REQUIREDRESOLUTION" value="'+(null==(__t=REQUIREDRESOLUTION)?"":_.escape(__t))+'" /> &#197;</td>\n\t</tr>\n</table>\n';return __p}},441:function(module,exports,__webpack_require__){var _=__webpack_require__(5);module.exports=function(obj){var __t,__p="",__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,"")};with(obj||{})__p+='<table>\n\t<tr class="">\n\t\t<td class="renderable">Box Size</td>\n\t\t<td class="renderable"><input type="text" name="BOXSIZEX" value="'+(null==(__t=BOXSIZEX)?"":_.escape(__t))+'" /> x <input type="text" name="BOXSIZEY"  value="'+(null==(__t=BOXSIZEY)?"":_.escape(__t))+'" /></td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">&Omega; Range</td>\n\t\t<td class="renderable"><input type="text" name="AXISRANGE" value="'+(null==(__t=AXISRANGE)?"":_.escape(__t))+'" /></td>\n\t</tr>\n\t\t<td class="renderable">Energy</td>\n\t\t<td class="renderable"><input type="text" name="ENERGY" value="'+(null==(__t=ENERGY)?"":_.escape(__t))+'" /> ev</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Transmission</td>\n\t\t<td class="renderable"><input type="text" name="TRANSMISSION" value="'+(null==(__t=TRANSMISSION)?"":_.escape(__t))+'" /> %</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Exposure</td>\n\t\t<td class="renderable"><input type="text" name="EXPOSURETIME" value="'+(null==(__t=EXPOSURETIME)?"":_.escape(__t))+'" /> s</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Resolution</td>\n\t\t<td class="renderable"><input type="text" name="REQUIREDRESOLUTION" value="'+(null==(__t=REQUIREDRESOLUTION)?"":_.escape(__t))+'" /> &#197;</td>\n\t</tr>\n</table>\n';return __p}},442:function(module,exports,__webpack_require__){var _=__webpack_require__(5);module.exports=function(obj){var __t,__p="",__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,"")};with(obj||{})__p+='<table>\n\t<tr>\n\t\t<td class="renderable">Beam Size</td>\n\t\t<td class="renderable"><input type="text" name="PREFERREDBEAMSIZEX" value="'+(null==(__t=PREFERREDBEAMSIZEX)?"":_.escape(__t))+'" />x <input type="text" name="PREFERREDBEAMSIZEY"  value="'+(null==(__t=PREFERREDBEAMSIZEY)?"":_.escape(__t))+'" />y &micro;m</td>\n\t</tr>\n\t<tr class="">\n\t\t<td class="renderable">Energy (ev)</td>\n\t\t<td class="renderable"><input type="text" name="ENERGY" value="'+(null==(__t=ENERGY)?"":_.escape(__t))+'" /></td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">&Omega; Range</td>\n\t\t<td class="renderable"><input type="text" name="AXISRANGE" value="'+(null==(__t=AXISRANGE)?"":_.escape(__t))+'" /> &deg;</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Transmission</td>\n\t\t<td class="renderable"><input type="text" name="TRANSMISSION" value="'+(null==(__t=TRANSMISSION)?"":_.escape(__t))+'" /> %</td>\n\t</tr>\n\t<tr>\n\t\t<td class="renderable">Exposure</td>\n\t\t<td class="renderable"><input type="text" name="EXPOSURETIME" value="'+(null==(__t=EXPOSURETIME)?"":_.escape(__t))+'" /> s</td>\n\t</tr>\n</table>\n';return __p}},443:function(t,e,i){(function(n){var r,a;r=[i(6)],void 0===(a=function(t){return t.Model.extend({idAttribute:"DIFFRACTIONPLANID",urlRoot:"/sample/plan",initialize:function(t,e){this.on("change:AXISRANGE change:NUMBEROFIMAGES change:AXISSTART",this.calculateAxisEnd),this.calculateAxisEnd(),e&&e.beamlinesetup&&(this.validation=JSON.parse(JSON.stringify(this.__proto__.validation)),n.each(this.validation,(function(t,i){var n=e.beamlinesetup.getRange({field:i});n&&(t.range=n)}),this))},calculateAxisEnd:function(){this.set("AXISEND",parseFloat(this.get("AXISSTART"))+parseInt(this.get("NUMBEROFIMAGES"))*parseFloat(this.get("AXISRANGE"))),this.trigger("computed:changed")},computed:function(){return["AXISEND"]},defaults:{WAVELENGTH:12658,AXISEND:0},validation:{EXPERIMENTKIND:{required:!0,pattern:"word"},REQUIREDRESOLUTION:{required:!0,pattern:"number"},EXPOSURETIME:{required:!0,pattern:"number"},PREFERREDBEAMSIZEX:{required:!0,pattern:"digits"},PREFERREDBEAMSIZEY:{required:!0,pattern:"digits"},AXISRANGE:{required:!1,pattern:"number"},AXISSTART:{required:!0,pattern:"number"},AXISEND:{required:!1,pattern:"number"},NUMBEROFIMAGES:{required:!0,pattern:"digits"},TRANSMISSION:{required:!0,pattern:"number"},ENERGY:{required:!0,pattern:"digits"}}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},444:function(t,e,i){(function(n){var r,a;r=[i(6)],void 0===(a=function(t){return t.Model.extend({idAttribute:"DIFFRACTIONPLANID",urlRoot:"/sample/plan",computed:function(){return[]},initialize:function(t,e){e&&e.beamlinesetup&&(this.validation=JSON.parse(JSON.stringify(this.__proto__.validation)),n.each(this.validation,(function(t,i){var n=e.beamlinesetup.getRange({field:i});n&&(t.range=n)}),this))},validation:{EXPERIMENTKIND:{required:!0,pattern:"word"},REQUIREDRESOLUTION:{required:!0,pattern:"number"},EXPOSURETIME:{required:!0,pattern:"number"},BOXSIZEX:{required:!0,pattern:"digits"},BOXSIZEY:{required:!0,pattern:"digits"},AXISRANGE:{required:!1,pattern:"number"},TRANSMISSION:{required:!0,pattern:"number"},ENERGY:{required:!0,pattern:"digits"}}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},445:function(t,e,i){(function(n){var r,a;r=[i(6)],void 0===(a=function(t){return t.Model.extend({idAttribute:"DIFFRACTIONPLANID",urlRoot:"/sample/plan",computed:function(){return[]},initialize:function(t,e){e&&e.beamlinesetup&&(this.validation=JSON.parse(JSON.stringify(this.__proto__.validation)),n.each(this.validation,(function(t,i){var n=e.beamlinesetup.getRange({field:i});n&&(t.range=n)}),this))},validation:{EXPERIMENTKIND:{required:!0,pattern:"word"},PREFERREDBEAMSIZEX:{required:!0,pattern:"digits"},PREFERREDBEAMSIZEY:{required:!0,pattern:"digits"},AXISRANGE:{required:!1,pattern:"number"},EXPOSURETIME:{required:!0,pattern:"number"},TRANSMISSION:{required:!0,pattern:"number"},ENERGY:{required:!0,pattern:"digits"}}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},450:function(t,e,i){(function(n){var r,a;r=[i(10),i(451),i(14)],void 0===(a=function(t,e,i){return t.extend(n.extend({},i,{model:e,mode:"client",url:"/exp/detectors",state:{pageSize:15},keyAttribute:"DESCRIPTION",valueAttribute:"DETECTORID"}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))},451:function(t,e,i){(function(n){var r,a;r=[i(6)],void 0===(a=function(t){return t.Model.extend({idAttribute:"DETECTORID",urlRoot:"/exp/detectors",defaults:[],initialize:function(t,e){n.each(this.validation,(function(t,e){this.defaults[e]="word"==t.pattern||"wwsdash"==t.pattern||"wwdash"==t.pattern?"":null}),this)},validation:{DETECTORTYPE:{required:!0,pattern:"wwsldash"},DETECTORMANUFACTURER:{required:!0,pattern:"wwdash"},DETECTORMODEL:{required:!0,pattern:"wwsdash"},DETECTORPIXELSIZEHORIZONTAL:{required:!1,pattern:"number"},DETECTORPIXELSIZEVERTICAL:{required:!1,pattern:"number"},DETECTORDISTANCEMIN:{required:!1,pattern:"number"},DETECTORDISTANCEMAX:{required:!1,pattern:"number"},DENSITY:{required:!1,pattern:"number"},COMPOSITION:{required:!1,pattern:"word"},DETECTORMAXRESOLUTION:{required:!1,pattern:"number"},DETECTORMINRESOLUTION:{required:!1,pattern:"number"},DETECTORROLLMIN:{required:!1,pattern:"number"},DETECTORROLLMAX:{required:!1,pattern:"number"},SENSORTHICKNESS:{required:!1,pattern:"digits"},DETECTORSERIALNUMBER:{required:!1,pattern:"wwdash"},NUMBEROFPIXELSX:{required:!1,pattern:"digits"},NUMBEROFPIXELSY:{required:!1,pattern:"digits"}}})}.apply(e,r))||(t.exports=a)}).call(this,i(5))},95:function(t,e,i){(function(n){var r,a;r=[i(6),i(1008),i(14)],void 0===(a=function(t,e,i){return t.Collection.extend(n.extend({},i,{plateTypes:[{name:"Puck",capacity:16},{name:"ReferencePlate",well_per_row:2,drop_per_well_x:1,drop_per_well_y:1,drop_height:1,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:4},{name:"CrystalQuickX",well_per_row:12,drop_per_well_x:2,drop_per_well_y:1,drop_height:.5,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:192},{name:"MitegenInSitu",well_per_row:12,drop_per_well_x:2,drop_per_well_y:1,drop_height:.5,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:192},{name:"FilmBatch",well_per_row:12,drop_per_well_x:1,drop_per_well_y:1,drop_height:1,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:96},{name:"MitegenInSitu_3_Drop",well_per_row:12,drop_per_well_x:3,drop_per_well_y:1,drop_height:.5,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:288},{name:"Greiner 3 Drop",well_per_row:12,drop_per_well_x:3,drop_per_well_y:1,drop_height:.5,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:288},{name:"MRC Maxi",well_per_row:6,drop_per_well_x:1,drop_per_well_y:1,drop_height:1,drop_width:.5,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:48},{name:"MRC 2 Drop",well_per_row:12,drop_per_well_x:1,drop_per_well_y:2,drop_height:1,drop_width:.5,drop_offset_x:.5,drop_offset_y:0,well_drop:-1,capacity:192},{name:"Griener 1536",well_per_row:12,drop_per_well_x:4,drop_per_well_y:4,drop_height:1,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:1536},{name:"3 Drop Square",well_per_row:12,drop_per_well_x:2,drop_per_well_y:2,drop_height:1,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:3,capacity:288},{name:"SWISSCI 3 Drop",well_per_row:12,drop_per_well_x:2,drop_per_well_y:2,drop_height:1,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:1,capacity:288},{name:"1 drop",well_per_row:12,drop_per_well_x:1,drop_per_well_y:1,drop_height:.5,drop_width:.5,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:96},{name:"LCP Glass",well_per_row:12,drop_per_well_x:1,drop_per_well_y:1,drop_height:1,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:96},{name:"PCRStrip",well_per_row:9,drop_per_well_x:1,drop_per_well_y:1,drop_height:1,drop_width:1,drop_offset_x:0,drop_offset_y:0,well_drop:-1,capacity:9}],model:e,keyAttribute:"name",valueAttribute:"name",initialize:function(t){this.reset(this.plateTypes),this.on("change:isSelected",this.onSelectedChanged,this)},onSelectedChanged:function(t){this.each((function(t){!0!==t.get("isSelected")||t._changing||t.set({isSelected:!1},{silent:!0})})),console.log("trigger selected change"),this.trigger("selected:change")}}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))},96:function(t,e,i){(function(n,r){var a,s;a=[i(7),i(6),i(11),i(18)],void 0===(s=function(t,e,i){return t.ItemView.extend({template:!1,tagName:"canvas",className:"plate",rankOption:null,collectionEvents:{"change reset":"drawPlate"},events:{mousemove:"hoverDrop",click:"clickDrop"},hoverDrop:function(t){var e=this._xy_to_drop(i.get_xy(t,this.$el));e!=this.hover&&(this.hover=e,this.drawPlate())},clickDrop:function(t){t.preventDefault();var e=this._xy_to_drop(i.get_xy(t,this.$el));if(e){var n=this.collection.findWhere({LOCATION:e.toString()});this.trigger("plate:select"),n&&n.set("isSelected",!0),this.drawPlate()}},initialize:function(t){this.pt=this.getOption("type"),this.inspectionimages=t&&t.inspectionimages,this.inspectionimages&&this.listenTo(this.inspectionimages,"sync",this.render,this),this.hover={},this.showImageStatus=this.getOption("showImageStatus"),this.showSampleStatus=this.getOption("showSampleStatus"),e.Validation.bind(this,{collection:this.collection})},setInspectionImages:function(t){this.inspectionimages=t,this.showImageStatus=!0,this.inspectionimages&&this.listenTo(this.inspectionimages,"sync",this.render,this)},setAutoScores:function(t){this.autoscores=t},setShowSampleStatus:function(t){this.showSampleStatus=t,this.showImageStatus=!t,this.drawPlate()},setRankStatus:function(t){this.rankOption=t,this.drawPlate()},setAutoStatus:function(t){this.autoOption=t,this.drawPlate()},onDomRefresh:function(){this.canvas=this.$el[0],this.ctx=this.canvas.getContext("2d"),this.canvas.width=this.$el.parent().width(),this.pt.get("capacity")==this.pt.get("well_per_row")?this.canvas.height=.2*this.canvas.width:this.canvas.height=.68*this.canvas.width,console.log("type",this.getOption("type"),this.canvas,this.ctx),this.pt.setGeometry(this.canvas.width,this.canvas.height),this.drawPlate(),n(document).unbind("keydown").bind("keydown",this.keyPress.bind(this))},keyPress:function(t){if(!(n(t.target).is("input")||n(t.target).is("select")||n(t.target).is("textarea"))){var e=this.collection.findWhere({isSelected:!0}),i=parseInt(e.get("LOCATION"));37==t.which?(t.preventDefault(),i--):39==t.which?(t.preventDefault(),i++):38==t.which?(t.preventDefault(),i-=this.pt.get("well_per_row")*this.pt.dropTotal()):40==t.which&&(t.preventDefault(),i+=this.pt.get("well_per_row")*this.pt.dropTotal());var r=this.collection.findWhere({LOCATION:i.toString()});r&&(r.set("isSelected",!0),this.drawPlate())}},onDestroy:function(){console.log("destroy plate"),n(document).unbind("keydown")},setType:function(t){this.pt=t,this.pt.setGeometry(this.canvas.width,this.canvas.height),this.drawPlate()},drawPlate:function(){if(console.log("draw plate"),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.rankOption)var t=this.collection.map((function(t){if(t.get(this.rankOption.value))return t.get(this.rankOption.value)}),this),e=[r.min(t),r.max(t)];for(var n=0;n<this.pt.get("well_per_row");n++)this.ctx.fillStyle="#000000",this.ctx.font=(this.canvas.width>500?18:14)+"px Arial",this.ctx.lineWidth=1,this.ctx.fillText(n+1,this.pt.get("offset_x")+n*(this.pt.get("well_width")+this.pt.get("well_pad")),20);for(var a=0;a<this.pt.wellTotal()/this.pt.get("well_per_row");a++){this.ctx.fillStyle="#000",this.ctx.font=(this.canvas.width>500?18:14)+"px Arial",this.ctx.lineWidth=1;var s=this.canvas.width>500?26:15;this.ctx.fillText(String.fromCharCode(a+65),0,s+this.pt.get("offset_y")+a*(this.pt.get("well_height")+this.pt.get("well_pad")))}for(var o=0;o<this.pt.wellTotal();o++){var l=o%this.pt.get("well_per_row"),p=Math.floor(o/this.pt.get("well_per_row"));this.ctx.beginPath(),this.ctx.strokeStyle="#000",this.ctx.rect(this.pt.get("offset_x")+l*(this.pt.get("well_width")+this.pt.get("well_pad")),this.pt.get("offset_y")+p*(this.pt.get("well_height")+this.pt.get("well_pad")),this.pt.get("well_width"),this.pt.get("well_height")),this.ctx.lineWidth=1,this.ctx.strokeStyle="#000",this.ctx.stroke();for(var d=0;d<this.pt.get("drop_per_well_x");d++)for(var u=0;u<this.pt.get("drop_per_well_y");u++){var _=u*this.pt.get("drop_per_well_x")+d;if(this.pt.get("well_drop")>-1){if(_==this.pt.get("well_drop"))continue;_>this.pt.get("well_drop")&&_--}var h=o*this.pt.dropTotal()+_+1,c=this.collection.findWhere({LOCATION:h.toString()});if(c&&this.showImageStatus&&this.inspectionimages)var E=this.inspectionimages.findWhere({BLSAMPLEID:c.get("BLSAMPLEID")});else E=null;if(this.ctx.beginPath(),this.ctx.lineWidth=1,c&&c.get("isSelected")?this.ctx.strokeStyle="cyan":c&&c.get("PROTEINID")>-1?this.showImageStatus?E?E.urlFor("full")in app.imagecache?this.ctx.strokeStyle="#000":this.ctx.strokeStyle="#aaa":this.ctx.strokeStyle="#ddd":this.ctx.strokeStyle="#000":this.ctx.strokeStyle="#ddd",this.ctx.rect(this.pt.get("drop_offset_x")+this.pt.get("offset_x")+l*(this.pt.get("well_width")+this.pt.get("well_pad"))+(d*this.pt.get("drop_widthpx")+this.pt.get("drop_pad")),this.pt.get("drop_offset_y")+this.pt.get("offset_y")+p*(this.pt.get("well_height")+this.pt.get("well_pad"))+(u*this.pt.get("drop_heightpx")+this.pt.get("drop_pad")),this.pt.get("drop_widthpx"),this.pt.get("drop_heightpx")),this.hover==h&&(this.ctx.fillStyle="#cccccc",this.ctx.fill()),c&&c.get("isSelected")&&(this.ctx.fillStyle="#dddddd",this.ctx.fill()),c&&this.getOption("showValid")&&(c.get("PROTEINID")>-1||c.get("CRYSTALID")>-1)&&(this.ctx.fillStyle=c.isValid(!0)?"#82d180":"#f26c4f",this.ctx.fill()),c&&this.showSampleStatus)if(this.rankOption){var f=(c.get(this.rankOption.value)-e[0])/(e[1]-e[0]);this.rankOption.min&&e[0]>this.rankOption.min&&(e[0]=this.rankOption.min),this.rankOption.inverted||(f=1-f),this.ctx.fillStyle=c.get(this.rankOption.value)?i.rainbow(f/4):c.get(this.rankOption.check)>0?"yellow":"#dfdfdf",this.ctx.fill()}else{var g=!1;r.each({GR:"#fdfd96",SC:"#fdfd96",AI:"#ffb347",DC:"#87ceeb",AP:"#77dd77"},(function(t,e){c.get(e)>0&&(this.ctx.fillStyle=t,g=!0)}),this),g&&this.ctx.fill()}if(c&&this.showImageStatus&&E){var I=E.get("SCORECOLOUR");I&&(this.ctx.fillStyle=I,this.ctx.fill())}if(c&&this.autoOption&&this.autoscores&&E){var S=this.autoscores.findWhere({BLSAMPLEIMAGEID:E.get("BLSAMPLEIMAGEID")}),m=S&&S.get("CLASSES")[this.autoOption];this.ctx.fillStyle=m?i.rainbow((1-m)/4):"#dfdfdf",this.ctx.fill()}this.ctx.stroke(),this.canvas.width>400&&c&&c.get("PROTEINID")>-1&&(this.ctx.fillStyle="#000",this.ctx.font="8px Arial",this.ctx.lineWidth=1,this.ctx.fillText(h,this.pt.get("drop_offset_x")+2+this.pt.get("offset_x")+l*(this.pt.get("well_width")+this.pt.get("well_pad"))+(d*this.pt.get("drop_widthpx")+this.pt.get("drop_pad")),this.pt.get("drop_offset_y")+10+this.pt.get("offset_y")+p*(this.pt.get("well_height")+this.pt.get("well_pad"))+(u*this.pt.get("drop_heightpx")+this.pt.get("drop_pad"))))}}},_xy_to_drop:function(t){var e=Math.floor((t[0]-this.pt.get("offset_x"))/(this.pt.get("well_width")+this.pt.get("well_pad"))),i=Math.floor((t[1]-this.pt.get("offset_y"))/(this.pt.get("well_height")+this.pt.get("well_pad"))),n=t[0]-this.pt.get("drop_offset_x")-this.pt.get("offset_x")-this.pt.get("drop_pad")-e*(this.pt.get("well_width")+this.pt.get("well_pad")),r=t[1]-this.pt.get("drop_offset_y")-this.pt.get("offset_y")-this.pt.get("drop_pad")-i*(this.pt.get("well_height")+this.pt.get("well_pad"));if(n>0&&n<this.pt.get("drop_per_well_x")*this.pt.get("drop_widthpx")&&r>0&&r<this.pt.get("drop_per_well_y")*this.pt.get("drop_heightpx")){var a=Math.floor(n/this.pt.get("drop_widthpx")),s=Math.floor(r/this.pt.get("drop_heightpx"))*this.pt.get("drop_per_well_x")+a;if(this.pt.get("well_drop")!=s&&(this.pt.get("well_drop")>-1&&s>this.pt.get("well_drop")&&s--,s<this.pt.dropTotal()))return s+(e+i*this.pt.get("well_per_row"))*this.pt.dropTotal()+1}}})}.apply(e,a))||(t.exports=s)}).call(this,i(8),i(5))},97:function(t,e,i){(function(n){var r,a;r=[i(10),i(174),i(14)],void 0===(a=function(t,e,i){return t.extend(n.extend({},i,{model:e,mode:"server",url:"/exp/setup",keyAttribute:"SETUPDATE",valueAttribute:"BEAMLINESETUPID",state:{pageSize:15},parseState:function(t,e,i,n){return{totalRecords:t.total}},parseRecords:function(t,e){return t.data}}))}.apply(e,r))||(t.exports=a)}).call(this,i(5))}}]);
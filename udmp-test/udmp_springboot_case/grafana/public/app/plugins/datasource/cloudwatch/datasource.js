/*! grafana - v4.1.2 - 2017-02-13
 * Copyright (c) 2017 Torkel Ödegaard; Licensed Apache-2.0 */

define(["angular","lodash","moment","app/core/utils/datemath","app/core/utils/kbn","./annotation_query"],function(a,b,c,d,e,f){"use strict";function g(c,g,h,i){function j(a,c,d){var e=/\{\{(.+?)\}\}/g,f=c.alias||"{{metric}}_{{stat}}",g={region:i.replace(c.region,d),namespace:i.replace(c.namespace,d),metric:i.replace(c.metricName,d)},h={};b.each(b.keys(c.dimensions),function(a){var b=i.replace(a,d),e=i.replace(c.dimensions[a],d);h[b]=e}),b.extend(g,h);var j=1e3*c.period;return b.map(c.statistics,function(c){var d=!b.includes(k.standardStatistics,c),h=[],i=null;b.chain(a.Datapoints).sortBy(function(a){return a.Timestamp}).each(function(a){var b=new Date(a.Timestamp).getTime();i&&b-i>j&&h.push([null,i+j]),i=b,d?h.push([a.ExtendedStatistics[c],b]):h.push([a[c],b])}).value(),g.stat=c;var l=f.replace(e,function(a,b){return g[b]?g[b]:b});return{target:l,datapoints:h}})}this.type="cloudwatch",this.name=c.name,this.supportMetrics=!0,this.proxyUrl=c.url,this.defaultRegion=c.jsonData.defaultRegion,this.standardStatistics=["Average","Maximum","Minimum","Sum","SampleCount"];var k=this;this.query=function(c){var d=k.convertToCloudWatchTime(c.range.from,!1),e=k.convertToCloudWatchTime(c.range.to,!0),f=[];if(c=a.copy(c),c.targets=this.expandTemplateVariable(c.targets,c.scopedVars,i),b.each(c.targets,function(a){if(!a.hide&&a.namespace&&a.metricName&&!b.isEmpty(a.statistics)){var g={};g.region=i.replace(a.region,c.scopedVars),g.namespace=i.replace(a.namespace,c.scopedVars),g.metricName=i.replace(a.metricName,c.scopedVars),g.dimensions=k.convertDimensionFormat(a.dimensions,c.scopedVars),g.statistics=a.statistics;var h=Math.round(Date.now()/1e3),j=this._getPeriod(a,g,c,d,e,h);a.period=j,g.period=j,f.push(g)}}.bind(this)),b.isEmpty(f)){var h=g.defer();return h.resolve({data:[]}),h.promise}var l=b.map(f,function(a){return this.performTimeSeriesQuery(a,d,e)}.bind(this));return g.all(l).then(function(a){var d=[];return b.each(a,function(a,b){var e=j(a,c.targets[b],c.scopedVars);d=d.concat(e)}),{data:d}})},this._getPeriod=function(a,b,c,d,f,g){var h,j=f-d,k=86400,l=60;return g-d>15*k?l=h=300:g-d>63*k?l=h=3600:g-d>455*k?l=h=3600:h=a.period?/^\d+$/.test(a.period)?parseInt(a.period,10):e.interval_to_seconds(i.replace(a.period,c.scopedVars)):"AWS/EC2"===b.namespace?300:60,h<60&&(h=60),j/h>=1440&&(h=Math.ceil(j/1440/l)*l),h},this.performTimeSeriesQuery=function(a,c,d){var e=b.filter(a.statistics,function(a){return b.includes(k.standardStatistics,a)}),f=b.reject(a.statistics,function(a){return b.includes(k.standardStatistics,a)});return this.awsRequest({region:a.region,action:"GetMetricStatistics",parameters:{namespace:a.namespace,metricName:a.metricName,dimensions:a.dimensions,statistics:e,extendedStatistics:f,startTime:c,endTime:d,period:a.period}})},this.getRegions=function(){return this.awsRequest({action:"__GetRegions"})},this.getNamespaces=function(){return this.awsRequest({action:"__GetNamespaces"})},this.getMetrics=function(a,b){return this.awsRequest({action:"__GetMetrics",region:b,parameters:{namespace:i.replace(a)}})},this.getDimensionKeys=function(a,b){return this.awsRequest({action:"__GetDimensions",region:b,parameters:{namespace:i.replace(a)}})},this.getDimensionValues=function(a,c,d,e,f){var g={region:i.replace(a),action:"ListMetrics",parameters:{namespace:i.replace(c),metricName:i.replace(d),dimensions:this.convertDimensionFormat(f,{})}};return this.awsRequest(g).then(function(a){return b.chain(a.Metrics).map("Dimensions").flatten().filter(function(a){return null!==a&&a.Name===e}).map("Value").uniq().sortBy().map(function(a){return{value:a,text:a}}).value()})},this.performEC2DescribeInstances=function(a,b,c){return this.awsRequest({region:a,action:"DescribeInstances",parameters:{filters:b,instanceIds:c}})},this.metricFindQuery=function(a){var c,d,e,f=function(a){return b.map(a,function(a){return{text:a}})},h=a.match(/^regions\(\)/);if(h)return this.getRegions();var j=a.match(/^namespaces\(\)/);if(j)return this.getNamespaces();var k=a.match(/^metrics\(([^\)]+?)(,\s?([^,]+?))?\)/);if(k)return this.getMetrics(k[1],k[3]);var l=a.match(/^dimension_keys\(([^\)]+?)(,\s?([^,]+?))?\)/);if(l)return this.getDimensionKeys(l[1],l[3]);var m=a.match(/^dimension_values\(([^,]+?),\s?([^,]+?),\s?([^,]+?),\s?([^,]+?)\)/);if(m){c=i.replace(m[1]),d=i.replace(m[2]),e=i.replace(m[3]);var n=i.replace(m[4]);return this.getDimensionValues(c,d,e,n,{})}var o=a.match(/^ebs_volume_ids\(([^,]+?),\s?([^,]+?)\)/);if(o){c=i.replace(o[1]);var p=i.replace(o[2]),q=[p];return this.performEC2DescribeInstances(c,[],q).then(function(a){var c=b.map(a.Reservations[0].Instances[0].BlockDeviceMappings,function(a){return a.Ebs.VolumeId});return f(c)})}var r=a.match(/^ec2_instance_attribute\(([^,]+?),\s?([^,]+?),\s?(.+?)\)/);if(r){c=i.replace(r[1]);var s=JSON.parse(i.replace(r[3])),t=b.map(s,function(a,b){return{Name:b,Values:a}}),u=i.replace(r[2]);return this.performEC2DescribeInstances(c,t,null).then(function(a){var c=b.chain(a.Reservations).map(function(a){return b.map(a.Instances,u)}).flatten().uniq().sortBy().value();return f(c)})}return g.when([])},this.performDescribeAlarms=function(a,b,c,d,e){return this.awsRequest({region:a,action:"DescribeAlarms",parameters:{actionPrefix:b,alarmNamePrefix:c,alarmNames:d,stateValue:e}})},this.performDescribeAlarmsForMetric=function(a,c,d,e,f,g){var h=b.includes(k.standardStatistics,f)?f:"",i=b.includes(k.standardStatistics,f)?"":f;return this.awsRequest({region:a,action:"DescribeAlarmsForMetric",parameters:{namespace:c,metricName:d,dimensions:e,statistic:h,extendedStatistic:i,period:g}})},this.performDescribeAlarmHistory=function(a,b,c,d){return this.awsRequest({region:a,action:"DescribeAlarmHistory",parameters:{alarmName:b,startDate:c,endDate:d}})},this.annotationQuery=function(a){var b=new f(this,a.annotation,g,i);return b.process(a.range.from,a.range.to)},this.testDatasource=function(){var a=this.defaultRegion,b="AWS/Billing",c="EstimatedCharges",d={};return this.getDimensionValues(a,b,c,"ServiceName",d).then(function(){return{status:"success",message:"Data source is working",title:"Success"}})},this.awsRequest=function(a){var b={method:"POST",url:this.proxyUrl,data:a};return h.datasourceRequest(b).then(function(a){return a.data})},this.getDefaultRegion=function(){return this.defaultRegion},this.getExpandedVariables=function(c,d,e){var f=b.find(e.options,{selected:!0,text:"All"});return b.chain(e.options).filter(function(a){return f?"All"!==a.text:a.selected}).map(function(b){var e=a.copy(c);return e.dimensions[d]=b.value,e}).value()},this.containsVariable=function(a,b){return a.indexOf("$"+b)!==-1},this.expandTemplateVariable=function(a,c,d){var e=this;return b.chain(a).map(function(a){var f=b.findKey(a.dimensions,function(a){return d.variableExists(a)&&!b.has(c,d.getVariableName(a))});if(f){var g=b.find(d.variables,function(b){return e.containsVariable(a.dimensions[f],b.name)});return e.getExpandedVariables(a,f,g)}return[a]}).flatten().value()},this.convertToCloudWatchTime=function(a,c){return b.isString(a)&&(a=d.parse(a,c)),Math.round(a.valueOf()/1e3)},this.convertDimensionFormat=function(a,c){return b.map(a,function(a,b){return{Name:i.replace(b,c),Value:i.replace(a,c)}})}}return g.$inject=["instanceSettings","$q","backendSrv","templateSrv"],{CloudWatchDatasource:g}});
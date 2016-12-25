import React from 'react';
import RouteList from './routelist.jsx';
import DraggingTip from './map/DraggingTip.js';
import DraggingLabel from './map/DraggingLabel.js';

class App extends React.Component {
    constructor(args) {
        super(args);
        this.state = {
            data: []
        }
        this.updateDataByIndex = this.updateDataByIndex.bind(this);
    }

    componentDidMount() {
    }

    addData() {
        var self = this;
        var project = map.getMapType().getProjection();
        var tex = this.refs.textarea.value;
        var pointArrs = [];
        var data = this.state.data;
        var point = null;
        var lines = tex.split(";");
        for (var j = 0; j < lines.length; j++) {
            var item = lines[j].split("|");
            var list = item[0];
            var points = list.split(",");
            var pointArr = [];
            var coordinates = [];
            for (var i = 0; i < points.length; i += 2) {
                if (points[i] > 10000) {
                    point = project.pointToLngLat(new BMap.Pixel(points[i], points[i+1]));
                } else {
                    point = new BMap.Point(points[i], points[i+1]);
                }
                pointArr.push(point);
                pointArrs.push(point);
            }
            data.push({
                points: pointArr,
                strokeColor: 'red',
                strokeWeight: 5,
                tipColor: '#ee5d5b',
                textPoint: pointArr[~~(pointArr.length / 2)],
                startPoint: pointArr[0],
                endPoint: pointArr[pointArr.length - 1],
                isShowArrow: true,
                isShowText: true,
                name: item[1],
                startName: item[2],
                endName: item[3]
            });
        }
        this.setState({
            data: data
        }, function() {
            self.renderRoads();
        });
        map.setViewport(pointArrs);
    }

    clearRoads() {
        map.clearOverlays();
    }

    renderRoads() {
        this.clearRoads();
        var data = this.state.data;
        for (var i = 0; i < data.length; i++) {
            map.addOverlay(new BMap.Polyline(data[i].points, {
                strokeColor: data[i].strokeColor || 'red',
                strokeWeight: data[i].strokeWeight || 5
            }));

            if (data[i].isShowArrow) {
                getDirection(data[i].points, ~~(data[i].points.length / 3));
                getDirection(data[i].points, ~~(data[i].points.length / 3 * 2));
            }

            if (data[i].isShowText) {
                (function(i){
                    if (data[i].name) {
                        var tip = new DraggingTip({
                            map: map,
                            point: data[i].textPoint,
                            name: data[i].name,
                            color: data[i].tipColor,
                            change: function() {
                                data[i].textPoint = tip.point;
                            }
                        });
                        tip.show();
                    }

                    if (data[i].startName) {
                        var start = new DraggingLabel({
                            map: map,
                            point: data[i].startPoint,
                            name: data[i].startName,
                            change: function() {
                                data[i].startPoint = start.point;
                            }
                        });
                        start.show();
                    }

                    if (data[i].endName) {
                        var end = new DraggingLabel({
                            map: map,
                            point: data[i].endPoint,
                            name: data[i].endName,
                            change: function() {
                                data[i].endPoint = end.point;
                            }
                        });
                        end.show();
                    }

                })(i);
            }

        }
    }

    updateDataByIndex(index, params) {
        var self = this;
        var data = this.state.data;
        var item = data[index];
        for (var key in params) {
            item[key] = params[key];
        }

        this.setState({
            data: data
        }, function() {
            this.renderRoads();
        });
    };

    render() {
        return (
            <div className="panel">
                <div className="inner">
                    <textarea ref="textarea" style={{height: '100px',width:'100%',border:'1px solid #999'}} className="" placeholder="高速公路|116.330484,40.031406,116.33124,40.029496,116.33124,40.029496,116.331391,40.029105,116.331391,40.029105,116.331471,40.028934,116.331522,40.028853,116.331572,40.028762,116.331622,40.028692,116.331693,40.028611,116.331833,40.028459,116.332024,40.028267,116.332215,40.028065,116.332326,40.027943,116.332406,40.027852,116.332477,40.027761,116.332547,40.027661,116.332608,40.02756,116.332658,40.027449,116.332688,40.027339,116.332708,40.027219,116.332708,40.027099,116.332688,40.026979,116.332688,40.026959,116.332668,40.026859,116.332618,40.02674,116.332548,40.026621,116.332498,40.026552,116.332458,40.026502,116.332348,40.026403,116.332247,40.026335,116.332127,40.026266,116.332056,40.026217,116.332056,40.026217,116.331966,40.026188,116.331836,40.02615,116.331615,40.026073,116.331474,40.026035,116.330751,40.025814,116.329716,40.025519,116.328551,40.025235,116.327727,40.025048,116.327345,40.024954,116.327114,40.024907"></textarea>
                    <a className="waves-effect waves-light btn" onClick={this.addData.bind(this)}>添加道路</a>
                </div>
                <RouteList data={this.state.data} updateDataByIndex={this.updateDataByIndex}/>
            </div>
        )
    }
}

function getDirection(points, i) {
    var project = map.getMapType().getProjection();
    var icon = new BMap.Icon("static/images/direction.png", new BMap.Size(20, 20), {
        imageSize: new BMap.Size(20, 20)
    });

    var curIndex = i;
    var curPos = points[curIndex];
    var marker = new BMap.Marker(curPos);
    // marker.enableDragging();
    map.addOverlay(marker);
    marker.setIcon(icon);
    marker.setShadow(icon);
    var targetPos = points[curIndex + 2]; 
    var curPos =  project.lngLatToPoint(curPos);
    var targetPos =  project.lngLatToPoint(targetPos);   


    if(targetPos.x != curPos.x){
        var tan =  - (targetPos.y - curPos.y)/(targetPos.x - curPos.x),
        atan  = Math.atan(tan);
        var deg = atan * 360 / (2 * Math.PI);
        // degree  correction;
        if(targetPos.x < curPos.x){
            deg = -deg + 90 + 90;
        } else {
            deg = -deg;
        }
        marker.setRotation(-deg);   
    }else {
        var disy = - (targetPos.y- curPos.y) ;
        var bias = 0;
        if(disy > 0)
            bias=-1
        else
            bias = 1
        marker.setRotation(-bias * 90);  
    }
    return marker;
}


export default App;
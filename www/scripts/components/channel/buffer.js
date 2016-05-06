'use strict';

var React   = require('react');
var Reflux  = require('reflux');
var Input   = require('./input');
var Message = require('./message');

var Component = React.createClass({
    render: function () {
        return (
            <div id="channel-buffer-wrap" className="col-xs-12 col-sm-7 col-md-5">
                <div id="channel-buffer">
                    <Message username="MajesticPANGOLIN" text="14 people!" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="WOW!" color="rgb(164, 94, 234)" />
                    <Message username="MajesticPANGOLIN" text="Who is the anonymous?" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="GREAT SHOT!" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="the FBI" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="guys ted cruz just dropped out of the presidential race" color="rgb(246, 102, 146)" />
                    <Message username="SalmonBaconator" text="QUick everyone, act cool" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="WHAAA" color="rgb(246, 102, 146)" />
                    <Message username="Rynorocks" text="it's between trump and kasich now" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="Whoa, that's crazy" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="Team Kasich!" color="rgb(246, 102, 146)" />
                    <Message username="MajesticPANGOLIN" text="14 people!" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="WOW!" color="rgb(164, 94, 234)" />
                    <Message username="MajesticPANGOLIN" text="Who is the anonymous?" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="GREAT SHOT!" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="the FBI" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="guys ted cruz just dropped out of the presidential race" color="rgb(246, 102, 146)" />
                    <Message username="SalmonBaconator" text="QUick everyone, act cool" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="WHAAA" color="rgb(246, 102, 146)" />
                    <Message username="Rynorocks" text="it's between trump and kasich now" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="Whoa, that's crazy" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="Team Kasich!" color="rgb(246, 102, 146)" />
                    <Message username="MajesticPANGOLIN" text="14 people!" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="WOW!" color="rgb(164, 94, 234)" />
                    <Message username="MajesticPANGOLIN" text="Who is the anonymous?" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="GREAT SHOT!" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="the FBI" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="guys ted cruz just dropped out of the presidential race" color="rgb(246, 102, 146)" />
                    <Message username="SalmonBaconator" text="QUick everyone, act cool" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="WHAAA" color="rgb(246, 102, 146)" />
                    <Message username="Rynorocks" text="it's between trump and kasich now" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="Whoa, that's crazy" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="Team Kasich!" color="rgb(246, 102, 146)" />
                    <Message username="MajesticPANGOLIN" text="14 people!" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="WOW!" color="rgb(164, 94, 234)" />
                    <Message username="MajesticPANGOLIN" text="Who is the anonymous?" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="GREAT SHOT!" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="the FBI" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="guys ted cruz just dropped out of the presidential race" color="rgb(246, 102, 146)" />
                    <Message username="SalmonBaconator" text="QUick everyone, act cool" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="WHAAA" color="rgb(246, 102, 146)" />
                    <Message username="Rynorocks" text="it's between trump and kasich now" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="Whoa, that's crazy" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="Team Kasich!" color="rgb(246, 102, 146)" />
                    <Message username="MajesticPANGOLIN" text="14 people!" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="WOW!" color="rgb(164, 94, 234)" />
                    <Message username="MajesticPANGOLIN" text="Who is the anonymous?" color="rgb(197, 148, 0)" />
                    <Message username="Rynorocks" text="GREAT SHOT!" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="the FBI" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="guys ted cruz just dropped out of the presidential race" color="rgb(246, 102, 146)" />
                    <Message username="SalmonBaconator" text="QUick everyone, act cool" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="WHAAA" color="rgb(246, 102, 146)" />
                    <Message username="Rynorocks" text="it's between trump and kasich now" color="rgb(164, 94, 234)" />
                    <Message username="SalmonBaconator" text="Whoa, that's crazy" color="rgb(244, 36, 219)" />
                    <Message username="boogers-in-your-soup" text="Team Kasich!" color="rgb(246, 102, 146)" />
                </div>
                <Input />
            </div>
        )
    }
});

module.exports = Component;

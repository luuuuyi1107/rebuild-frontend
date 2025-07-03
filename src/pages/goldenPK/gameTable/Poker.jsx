import React from "react"
import "./Poker.scss"
import config from "@/config/config"
import classNames from "classnames"
export default class extends React.PureComponent {
  state = {
    hidden: true,
    active: false,
  }
  time = new Date().getTime()
  componentDidMount() {
    let timeout = this.props.timeout || 100
    let openTimeout = this.props.openTimeout || 100
    this.timer1 = setTimeout(() => {
      this.setState({ hidden: false })
    }, timeout)
    this.timer2 = setTimeout(() => {
      this.setState({ active: true })
    }, openTimeout)
  }
  componentWillUnmount() {
    if (this.timer1) {
      clearTimeout(this.timer1)
    }
    if (this.timer2) {
      clearTimeout(this.timer2)
    }
  }
  // componentWillReceiveProps(nextProps){
  //     if((this.props.shape!=nextProps.shape)||(this.props.value!=nextProps.value)){
  //         console.log(this.props);
  //         console.log(nextProps);
  //         let openTimeout = this.props.openTimeout || 200;
  //         let timeout = this.props.timeout || 200;
  //         this.setState({active:false, hidden: true,})
  //         if(this.timer2){
  //             clearTimeout(this.timer2);
  //             this.timer2 = setTimeout(()=>{
  //                 this.setState({active: true});
  //             }, openTimeout);
  //         }else{
  //             this.timer2 = setTimeout(()=>{
  //                 this.setState({active: true});
  //             }, openTimeout);
  //         }
  //         if(this.timer1){
  //             clearTimeout(this.timer1);
  //             this.timer1 = setTimeout(()=>{
  //                 this.setState({hidden: false});
  //             }, timeout);
  //         }else{
  //             this.timer1 = setTimeout(()=>{
  //                 this.setState({hidden: false});
  //             }, timeout);
  //         }
  //     }
  //     // this.showConfirm(nextProps);
  // }
  render() {
    let value = this.props.value
    let shape = this.props.shape
    let shapeMap = {
      clubs: "&clubs;",
      spades: "&spades;",
      hearts: "&hearts;",
      diamonds: "&diams;",
    }
    return (
      <div className={classNames("wrapper", "golden-poker-card", this.props.className, shape, { hidden: this.state.hidden })}>
        <div className={`card-container ${this.state.active ? (value != "*" ? "active" : "") : ""} ${this.props.shape}`}>
          <div className="card-face card-front">
            <span>{config.pokerBg || "BAC"}</span>
          </div>
          <div className="card-face card-back">
            <span className="num1">{value}</span>
            {shape == "*" ? <span className="shape">?</span> : <span className="shape" dangerouslySetInnerHTML={{ __html: shapeMap[shape] }}></span>}
            {/*<span className="shape" dangerouslySetInnerHTML={{__html: shapeMap[shape]}}></span>*/}
            <span className="num2">{value}</span>
          </div>
        </div>
      </div>
    )
  }
}

import Tilt from "react-parallax-tilt";
import './Logo.css';
import brain from './brain.png'
const Logo = () => {
  return (
    <div className="ma4 mt0">
      <Tilt className="br2 shadow-2 Tilt" tiltMaxAngleX={55}
            tiltMaxAngleY={55} style={{ height: "150px",width:"150px" }}>
        <div className="flex justify-center items-center h-100"> 
          <img src={brain} alt='logo'  style={{ paddingTop:'5px',height:'100px',width:'100px' }}/>
        </div>
      </Tilt>
    </div>
  );
};
export default Logo;

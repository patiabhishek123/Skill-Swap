import pimg from '../assets/pimg.jpg';

export const Home = () => {
  return (
    <div className="home-wrapper">
      <div className="navbar">
        <div className='logo-head'>Skill Swap Platform</div>
        <div className="login-btn">
          <a href="/login" className='login'>Login</a>
        </div>
      </div>
      <div className="contents-wrapper">
        <div className="search-nav">
          <input type="text" />
          <button>search</button>
        </div>
        <div className="content">
          <div className="user">
            <div className="profile"><img src={pimg} alt="" /></div>
            <div className="dets">
              <div className="name">Marc Demo</div>
              <br />
              <div className="skills-offered">Skills Offered: Javascript</div>
              <div className="skills-offered">Skills Worked: Python</div>
            </div>
          </div>
          <div className='stats'>
            <div className="request-btn">Request</div>
            <div className="rating">Rating : 3.9/5</div>
          </div>
        </div>
        <div className="content">
          <div className="user">
            <div className="profile"><img src={pimg} alt="" /></div>
            <div className="dets">
              <div className="name">Marc Demo</div>
              <br />
              <div className="skills-offered">Skills Offered: Javascript</div>
              <div className="skills-offered">Skills Worked: Python</div>
            </div>
          </div>
          <div className='stats'>
            <div className="request-btn">Request</div>
            <div className="rating">Rating : 3.9/5</div>
          </div>
        </div>
        <div className="content">
          <div className="user">
            <div className="profile"><img src={pimg} alt="" /></div>
            <div className="dets">
              <div className="name">Marc Demo</div>
              <br />
              <div className="skills-offered">Skills Offered: Javascript</div>
              <div className="skills-offered">Skills Worked: Python</div>
            </div>
          </div>
          <div className='stats'>
            <div className="request-btn">Request</div>
            <div className="rating">Rating : 3.9/5</div>
          </div>
        </div>
      </div>
    </div>
  )
};

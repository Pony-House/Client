import React from 'react';
import PropTypes from 'prop-types';

function AuthDivBase({ children, bannerSupport = false }) {
  return (
    <div
      className={`${bannerSupport ? 'col-md-6 col-lg-7 d-flex align-items-center banner-support ' : ''}card-fullscren-base`}
    >
      <div className="card-body p-lg-4 px-lg-5">{children}</div>
    </div>
  );
}

AuthDivBase.propTypes = {
  bannerSupport: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

function AuthDivBaseWithBanner({ children }) {
  return (
    <>
      <div className={`col-md-6 col-lg-5 d-none d-md-block banner`} />
      <AuthDivBase bannerSupport>{children}</AuthDivBase>
    </>
  );
}

AuthDivBaseWithBanner.propTypes = {
  bannerSupport: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export { AuthDivBaseWithBanner };
export default AuthDivBase;

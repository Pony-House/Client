import React from 'react';
import PropTypes from 'prop-types';

import { getUserStatus } from '../../../util/onlineStatus';

const UserStatusIcon = React.forwardRef(
  ({ user = null, presenceData = null, className = null, classBase = 'user-status' }, ref) => {
    return (
      <i
        ref={ref}
        className={`${classBase ? `${classBase} ` : ''}user-status-icon${className ? ` ${className}` : ''} ${getUserStatus(user, presenceData)}`}
      />
    );
  },
);

UserStatusIcon.propTypes = {
  className: PropTypes.string,
  classBase: PropTypes.string,
  presenceData: PropTypes.object,
  user: PropTypes.object.isRequired,
};

export default UserStatusIcon;

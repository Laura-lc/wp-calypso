/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import spritePath from 'social-logos/svg-sprite/social-logos.svg';

function SocialLogo( props ) {
	const { size = 24, icon, onClick, className, ...otherProps } = props;

	// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
	// This means we don't need to perform any checks on the icon name.
	const iconName = `social-logo-${ icon }`;
	// The current CSS expects individual icon classes in the form of e.g. `.twitter`, but the social-logos build
	// appears to generate them in the form of `.social-logo-twitter` instead.
	// We add both here, to ensure compatibility.
	const iconClass = classnames( 'social-logo', iconName, icon, className );

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={ iconClass }
			height={ size }
			width={ size }
			onClick={ onClick }
			{ ...otherProps }
		>
			<use xlinkHref={ `${ spritePath }#${ icon }` } />
		</svg>
	);
}

SocialLogo.propTypes = {
	icon: PropTypes.string.isRequired,
	size: PropTypes.number,
	onClick: PropTypes.func,
	className: PropTypes.string,
};

export default React.memo( SocialLogo );
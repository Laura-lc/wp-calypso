// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * External dependencies
 */
import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import ReactDOM from 'react-dom';
import {
	Checkout,
	CheckoutSteps,
	CheckoutStep,
	CheckoutStepBody,
	CheckoutProvider,
	createApplePayMethod,
	createPayPalMethod,
	createRegistry,
	createStripeMethod,
	getDefaultOrderReviewStep,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	useIsStepActive,
	useSelect,
	useDispatch,
} from '../src/public-api';

const stripeKey = 'pk_test_zIh4nRbVgmaetTZqoG4XKxWT';

const initialItems = [
	{
		label: 'WordPress.com Personal Plan',
		id: 'wpcom-personal',
		type: 'plan',
		amount: { currency: 'USD', value: 6000, displayValue: '$60' },
	},
	{
		label: 'Domain registration',
		subLabel: 'example.com',
		id: 'wpcom-domain',
		type: 'domain',
		amount: { currency: 'USD', value: 0, displayValue: '~~$17~~ 0' },
	},
];

const onPaymentComplete = () => {
	const successRedirectUrl = '/complete.html';
	window.location.href = successRedirectUrl;
};
const onEvent = event => window.console.log( 'Event', event );
const showErrorMessage = error => {
	console.log( 'Error:', error ); /* eslint-disable-line no-console */
	window.alert( 'There was a problem with your payment: ' + error );
};
const showInfoMessage = message => {
	console.log( 'Info:', message ); /* eslint-disable-line no-console */
	window.alert( message );
};
const showSuccessMessage = message => {
	console.log( 'Success:', message ); /* eslint-disable-line no-console */
	window.alert( message );
};

async function fetchStripeConfiguration() {
	// This simulates the network request time
	await asyncTimeout( 2000 );
	return {
		public_key: stripeKey,
		js_url: 'https://js.stripe.com/v3/',
	};
}

async function sendStripeTransaction( data ) {
	window.console.log( 'Processing stripe transaction with data', data );
	// This simulates the transaction and provisioning time
	await asyncTimeout( 2000 );
	return {
		success: true,
	};
}

async function makePayPalExpressRequest( data ) {
	window.console.log( 'Processing paypal transaction with data', data );
	// This simulates the transaction and provisioning time
	await asyncTimeout( 2000 );
	return window.location.href;
}

const registry = createRegistry();
const { registerStore, select } = registry;

registerStore( 'demo', {
	actions: {
		setCountry( payload ) {
			return { type: 'set_country', payload };
		},
	},
	selectors: {
		getCountry( state ) {
			return state.country;
		},
	},
	reducer( state = {}, action ) {
		if ( action.type === 'set_country' ) {
			return { ...state, country: action.payload };
		}
		return state;
	},
} );

const stripeMethod = createStripeMethod( {
	getCountry: () => select( 'demo' ).getCountry(),
	getPostalCode: () => 90210,
	getPhoneNumber: () => 5555555555,
	getSubdivisionCode: () => 'CA',
	registerStore,
	fetchStripeConfiguration,
	submitTransaction: sendStripeTransaction,
} );

const applePayMethod = isApplePayAvailable()
	? createApplePayMethod( {
			getCountry: () => select( 'demo' ).getCountry(),
			getPostalCode: () => 90210,
			getPhoneNumber: () => 5555555555,
			registerStore,
			fetchStripeConfiguration,
			submitTransaction: sendStripeTransaction,
	  } )
	: null;

const paypalMethod = createPayPalMethod( {
	registerStore,
	submitTransaction: makePayPalExpressRequest,
	getSuccessUrl: () => '#',
	getCancelUrl: () => '#',
} );

export function isApplePayAvailable() {
	// Our Apple Pay implementation uses the Payment Request API, so check that first.
	if ( ! window.PaymentRequest ) {
		return false;
	}

	// Check if Apple Pay is available. This can be very expensive on certain
	// Safari versions due to a bug (https://trac.webkit.org/changeset/243447/webkit),
	// and there is no way it can change during a page request, so cache the
	// result.
	if ( typeof isApplePayAvailable.canMakePayments === 'undefined' ) {
		try {
			isApplePayAvailable.canMakePayments = Boolean(
				window.ApplePaySession && window.ApplePaySession.canMakePayments()
			);
		} catch ( error ) {
			console.error( error ); // eslint-disable-line no-console
			return false;
		}
	}
	return isApplePayAvailable.canMakePayments;
}

const getTotal = items => {
	const lineItemTotal = items.reduce( ( sum, item ) => sum + item.amount.value, 0 );
	const currency = items.reduce( ( lastCurrency, item ) => item.amount.currency, 'USD' );
	return {
		label: 'Total',
		amount: {
			currency,
			value: lineItemTotal,
			displayValue: formatValueForCurrency( currency, lineItemTotal ),
		},
	};
};

const ContactFormTitle = () => {
	const isActive = useIsStepActive();
	return isActive ? 'Enter your contact details' : 'Contact details';
};

const Label = styled.label`
	display: block;
	color: ${props => props.theme.colors.textColor};
	font-weight: ${props => props.theme.weights.bold};
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${props => ( props.disabled ? 'default' : 'pointer' )};
	}
`;

const Input = styled.input`
	display: block;
	width: 100%;
	box-sizing: border-box;
	font-size: 16px;
	border: 1px solid
		${props => ( props.isError ? props.theme.colors.error : props.theme.colors.borderColor )};
	padding: 13px 10px 12px 10px;

	:focus {
		outline: ${props => ( props.isError ? props.theme.colors.error : props.theme.colors.outline )}
			solid 2px !important;
	}
`;

const Form = styled.div`
	margin-bottom: 0.5em;
`;

function ContactForm( { summary } ) {
	const country = useSelect( storeSelect => storeSelect( 'demo' )?.getCountry() ?? '' );
	const { setCountry } = useDispatch( 'demo' );
	const onChangeCountry = event => setCountry( event.target.value );

	if ( summary ) {
		return (
			<div>
				<div>Country</div>
				<span>{ country }</span>
			</div>
		);
	}

	return (
		<Form>
			<Label htmlFor="country">Country</Label>
			<Input id="country" type="text" value={ country } onChange={ onChangeCountry } />
		</Form>
	);
}

const orderSummaryStep = getDefaultOrderSummaryStep();
const paymentMethodStep = getDefaultPaymentMethodStep();
const reviewOrderStep = getDefaultOrderReviewStep();
const contactFormStep = {
	id: 'contact-form',
	className: 'checkout__billing-details-step',
	titleContent: <ContactFormTitle />,
	activeStepContent: <ContactForm />,
	completeStepContent: <ContactForm summary />,
};

// This is the parent component which would be included on a host page
function MyCheckout() {
	const [ items ] = useState( initialItems );
	const total = useMemo( () => getTotal( items ), [ items ] );

	// This simulates loading the data
	const [ isLoading, setIsLoading ] = useState( true );
	useEffect( () => {
		setTimeout( () => setIsLoading( false ), 1500 );
	}, [] );

	return (
		<CheckoutProvider
			locale={ 'en' }
			items={ items }
			total={ total }
			onEvent={ onEvent }
			onPaymentComplete={ onPaymentComplete }
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
			registry={ registry }
			isLoading={ isLoading }
			paymentMethods={ [ applePayMethod, stripeMethod, paypalMethod ].filter( Boolean ) }
		>
			<MyCheckoutBody />
		</CheckoutProvider>
	);
}

function MyCheckoutBody() {
	const country = useSelect( storeSelect => storeSelect( 'demo' )?.getCountry() ?? '' );

	return (
		<Checkout>
			<CheckoutStepBody
				activeStepContent={ orderSummaryStep.activeStepContent }
				completeStepContent={ orderSummaryStep.completeStepContent }
				titleContent={ orderSummaryStep.titleContent }
				errorMessage={ 'There was an error with this step.' }
				isStepActive={ false }
				isStepComplete={ true }
				stepNumber={ 1 }
				totalSteps={ 1 }
				stepId={ 'order-summary' }
			/>
			<CheckoutSteps>
				<CheckoutStep
					stepId="payment-method-step"
					isCompleteCallback={ () =>
						new Promise( resolve => setTimeout( () => resolve( true ), 1500 ) )
					}
					activeStepContent={ paymentMethodStep.activeStepContent }
					completeStepContent={ paymentMethodStep.completeStepContent }
					titleContent={ paymentMethodStep.titleContent }
				/>
				<CheckoutStep
					stepId={ contactFormStep.id }
					isCompleteCallback={ () => {
						return country.length > 0;
					} }
					activeStepContent={ contactFormStep.activeStepContent }
					completeStepContent={ contactFormStep.completeStepContent }
					titleContent={ contactFormStep.titleContent }
				/>
				<CheckoutStep
					stepId="review-order-step"
					isCompleteCallback={ () => true }
					activeStepContent={ reviewOrderStep.activeStepContent }
					completeStepContent={ reviewOrderStep.completeStepContent }
					titleContent={ reviewOrderStep.titleContent }
				/>
			</CheckoutSteps>
		</Checkout>
	);
}

function formatValueForCurrency( currency, value ) {
	if ( currency !== 'USD' ) {
		throw new Error( `Unsupported currency ${ currency }'` );
	}
	const floatValue = value / 100;
	return '$' + floatValue.toString();
}

// Simulate network request time
async function asyncTimeout( timeout ) {
	return new Promise( resolve => setTimeout( resolve, timeout ) );
}

ReactDOM.render( <MyCheckout />, document.getElementById( 'root' ) );

/**
 * Internal dependencies
 */
import { receiveSections } from 'sections-helper';
import sections from 'sections';
import pathToSection from '..';

describe( 'pathToSection', () => {
	beforeAll( () => {
		// initialize the sections-helper module with the sections list
		receiveSections( sections );
	} );

	test( 'should handle cases where path and section have different names', () => {
		expect( pathToSection( '/me/account' ) ).toBe( 'account' );
	} );

	test( 'should correctly associate paths that start with the same string', () => {
		expect( pathToSection( '/themes' ) ).toBe( 'themes' );
		expect( pathToSection( '/theme' ) ).toBe( 'theme' );
		expect( pathToSection( '/media' ) ).toBe( 'media' );
		expect( pathToSection( '/me' ) ).toBe( 'me' );
	} );

	test( 'should handle deep paths', () => {
		expect( pathToSection( '/me/account' ) ).toBe( 'account' );
	} );

	test( 'should return null if unsuccessful', () => {
		expect( pathToSection( '/a-nonexistent-path' ) ).toBeNull();
	} );
} );

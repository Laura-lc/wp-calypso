/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { BlockPreview } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
// import BlockPreview from './block-preview';
import TemplatePreviewFrame from './template-preview-Frame';

/* eslint-enable import/no-extraneous-dependencies */

const BlockTemplatePreview = ( { blocks = [], viewportWidth } ) => {
	/*
	 * It injects an Iframe between the scaled element and the blocks container.
	 */
	// const movePreviewToIFrame = useCallback(
	// 	( { previewContainerRef } ) => {
	// 		const { current: previewWrapper } = previewContainerRef;
	// 		if ( ! previewWrapper ) {
	// 			return;
	// 		}

	// 	},
	// 	[ blocks ]
	// );

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<TemplatePreviewFrame>
			<div className={ `block-preview-iframe-body ${ ! blocks.length ? 'not-selected' : '' }` }>
				<div className="edit-post-visual-editor">
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow">
							<BlockPreview
								blocks={ blocks }
								viewportWidth={ viewportWidth }
								// __experimentalOnReady={ movePreviewToIFrame }
							/>
						</div>
					</div>
				</div>
			</div>
		</TemplatePreviewFrame>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default BlockTemplatePreview;

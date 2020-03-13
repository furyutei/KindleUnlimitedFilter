// ==UserScript==
// @name         Kindle Unlimited Filter
// @namespace    https://furyutei.work
// @version      0.0.2
// @description  Amazon Kindle検索時にKindle Unlimitedの「□ 読み放題対象タイトル」が出ないケースでもフィルタできるようにする
// @author       furyu
// @match        https://www.amazon.co.jp/*
// @grant        none
// ==/UserScript==

( ( SCRIPT_NAME ) => {
'use strict';

const
    UNLIMITED_ONLY_TEXT = 'Unlimited 読み放題のみ';


let unlimited_item = document.querySelector( '[id="p_n_feature_nineteen_browse-bin/3169286051"]' ),
    unlimited_checkbox = unlimited_item ?
        // 通常の絞り込み時の「□ 読み放題対象タイトル」チェックボックス
        unlimited_item.querySelector( 'input[type="checkbox"]' ) :
        // [Kindle本トップページ](https://www.amazon.co.jp/gp/browse.html?node=2275256051)等に存在するチェックボックス
        document.querySelector( 'input[name="s-ref-checkbox-3169286051"]' ),
    
    unlimited_url_or_function = ( () => {
        if ( unlimited_checkbox ) {
            if ( unlimited_checkbox.checked ) {
                return;
            }
            
            if ( unlimited_item ) {
                let unlimited_link = unlimited_item.querySelector( 'a[data-routing]' );
                
                if ( unlimited_link ) {
                    return unlimited_link.href;
                }
            }
            else {
                return () => {
                    unlimited_checkbox.click();
                };
            }
        }
        
        let category_link = document.querySelector( '[cel_widget_id="RESULT_INFO_BAR-RESULT_INFO_BAR"] a[data-routing]' );
        
        if ( ! ( category_link && /[?&]i=digital-text(?:&|$)/.test( category_link.href ) ) ) {
            // Kindleストア以外
            return;
        }
        
        let query_map = [ ... new URL( location.href ).searchParams.entries() ].reduce( ( acc, cur ) => ( { ... acc, [ cur[ 0 ] ] : cur[ 1 ] } ), {} );
        
        const
            rh_unlimited = 'p_n_feature_nineteen_browse-bin:3169286051';
        
        let rh_list = ( 'rh' in query_map ) ? query_map.rh.split( ',' ) : [];
        
        if ( rh_list.includes( rh_unlimited ) ) {
            return;
        }
        
        rh_list.push( rh_unlimited );
        
        query_map.rh = rh_list.join( ',' );
        
        let unlimited_url = location.href.replace( /\?.*$/, '' ) + '?' + Object.entries( query_map ).map( q => q[ 0 ] + '=' + encodeURIComponent( q[ 1 ] ) ).join( '&' );
        
        return unlimited_url;
    } )();


if ( ( ! unlimited_checkbox ) && ( ! unlimited_url_or_function ) ) {
    return;
}


let is_unlimited_page = unlimited_checkbox && unlimited_checkbox.checked,
    unlimited_link = document.createElement( 'a' ),
    on_click_handler = ( () => {
        if ( is_unlimited_page ) {
            return () => {
                ( ( unlimited_item && unlimited_item.querySelector( 'a[data-routing]' ) ) || unlimited_checkbox ).click();
            };
        }
        
        if ( typeof unlimited_url_or_function == 'function' ) {
            return unlimited_url_or_function;
        }
        
        return () => {
            location.href = unlimited_url_or_function;
        };
    } )();

unlimited_link.href = '#';
unlimited_link.insertAdjacentHTML( 'afterbegin', '<label><input type="checkbox" /><span class="nav-a-content">' + UNLIMITED_ONLY_TEXT + '</span></label>' );

let unlimited_only_checkbox = unlimited_link.querySelector( 'input' ),
    unlimited_only_content = unlimited_link.querySelector( 'span' );

Object.assign( unlimited_only_checkbox.style, {
    verticalAlign : 'middle',
    marginRight : '4px',
    bottom : 'auto',
    cursor : 'pointer',
} );

if ( is_unlimited_page ) {
    unlimited_only_checkbox.checked = true;
}

unlimited_link.addEventListener( 'click', ( event ) => {
    event.preventDefault();
    event.stopPropagation();
    
    unlimited_only_checkbox.checked = ! unlimited_only_checkbox.checked;
    unlimited_only_checkbox.disabled = true;
    
    on_click_handler();
} );

/*
//let sort_selector = document.querySelector( '[cel_widget_id="RESULT_INFO_BAR-RESULT_INFO_BAR"] span[data-component-type="s-result-sort"]' );
//
//if ( sort_selector ) {
//    Object.assign( unlimited_link.style, {
//        marginRight : '8px',
//    } );
//    
//    sort_selector.parentNode.insertBefore( unlimited_link, sort_selector );
//    return;
//}
*/

let nav_subnav = document.querySelector( '[id="nav-subnav"]' );

if ( ! nav_subnav ) {
    return;
}

unlimited_link.className = 'nav-a';
Object.assign( unlimited_link.style, {
    /*cssFloat: 'right',*/
    position : 'absolute',
    top : '0',
    right : '0',
    background : 'inherit',
} );

nav_subnav.appendChild( unlimited_link );

} )( 'KindleUnlimitedFilter' );

import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useBlockLayout, useSortBy, useTable, useResizeColumns, useGroupBy, useExpanded, useColumnOrder } from 'react-table';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import * as actions from '../../store/actions/index';
import DropDown from '../DropDown/DropDown';
import classes from './ReactTable.module.css';
import icon from '../../assets/svg/all.svg';
import { List } from 'react-virtualized';
import { useSticky } from "react-table-sticky";
let allData;
let columns = [
	{
		id: 'code',
		Header: 'code',
		className: "code__cell", // className is same as header
		accessor: 'colCode', // accessor is the "key" in the data
		// sticky: 'left',
	},
	{
		id: 'label',
		Header: 'label',
		className: "label__cell", // className is same as header
		accessor: 'colLable', //use the to put data in this colomn like in the data const
	},
	{
		id: 'valid form',
		Header: 'valid form',
		className: "valid_form__cell", // className is same as header
		accessor: 'colValidForm',
		// Cell: (props) => {
		// 	const d = props.value;
		// 	const date = new Date(d);

		// 	const formattedDate = formatDate(date);

		// 	return formattedDate;
		// },
	},
	{
		id: 'valid to',
		Header: 'valid to',
		className: "valid_to__cell", // className is same as header
		accessor: 'colValidTo',
		sortable: false,
		disableSortBy: true,
		// Cell: (props) => {
		// 	const d = props.value;
		// 	const date = new Date(d);

		// 	// calling the fuction to format the date as "DD-MM-YYYY"
		// 	const formattedDate = formatDate(date);

		// 	return formattedDate;
		// },
	},
	{
		id: 'airport iata',
		Header: 'airport iata',
		className: "airport_iata__cell", // className is same as header
		accessor: 'colAirport',
	},
	{
		id: 'remarks',
		Header: 'remarks',
		className: "remarks__cell", // className is same as header
		accessor: 'colRemarks',
	},
];
const ReactTable = (props) => {
	let Id = -1;
	const currentColOrder = React.useRef();
	// array of object each object is a row
	const [data, setData] = useState([]);
	useEffect(() => {
		allData = []
		props.clients.map((ob) => {
			return allData.push({
				colCode: ob.code,
				colLable: ob.label,
				colValidForm: ob.validFrom,
				colValidTo: ob.validTo,
				colAirport: ob.airportCode,
				colRemarks: ob.remarks,
				id: ob.id,
			});
		});
		setData(allData)
	}, [props.clients, props.columnsToHide])

	// const formatDate = (date) => {
	// 	let day = date.getDate();
	// 	let month = date.getMonth() + 1;
	// 	const year = date.getFullYear();

	// 	if (month.toString().length < 2) {
	// 		month = '0' + month;
	// 	}
	// 	if (day.toString().length < 2) {
	// 		day = '0' + day;
	// 	}

	// 	return [day, month, year].join('-');
	// };


	const defaultColumn = React.useMemo(
		() => ({
			// minWidth: 100,
			// width: 161,
			// maxWidth: 300,
		}),
		[]
	);


	const displayData = useCallback(
		(el) => {
			let ojectFromArray;
			data.forEach((ell) => {
				if (ell.colCode === el.target.parentNode.children[0].innerHTML) {
					ojectFromArray = ell;
				}
			});
			if (ojectFromArray !== undefined) {
				const ob = {
					code: ojectFromArray.colCode,
					label: ojectFromArray.colLable,
					validFrom: ojectFromArray.colValidForm,
					validTo: ojectFromArray.colValidTo,
					airportCode: ojectFromArray.colAirport,
					remarks: ojectFromArray.colRemarks,
					id: ojectFromArray.id,
				};

				props.onExtractClient(ob);
				props.onFormDisplay(true);

				const selectedRow = el.target.parentNode.childNodes;

				const unselectedRows = Array.from(document.getElementsByTagName('tr'));

				unhighlightUnselectedRows(unselectedRows);
				highlightSelectedRow(selectedRow);
			}
		},
		[data, props]
	);

	const unhighlightUnselectedRows = (notSelectedRows) => {
		notSelectedRows.forEach((row) => {
			row.childNodes.forEach((td) => {
				td.style.backgroundColor = '';
				td.style.color = ' #39648f';
			});
		});
	};

	const highlightSelectedRow = (row) => {
		row.forEach((td) => {
			td.style.backgroundColor = '#47729c';
			td.style.color = 'white';
		});
	};

	const searchColumn = (inputId, value, select) => {
		let input;
		let id = inputId;
		let selectVal = 'contains';
		if (value === undefined)
			input = document.getElementById(`${inputId}search`).value;
		else {
			input = value;
			id = localSearchIds[inputId];
			selectVal = select;
		}

		let arrOfInputs = input.split(' ');
		if (arrOfInputs[0] === '') {
			setData(allData);
		}
		else {
			let access = null;
			columns.forEach((el) => {
				if (el.id === id)
					access = el.accessor
			})

			let matchedData = [];
			switch (selectVal) {
				case 'contains':
					allData.forEach((el) => {
						arrOfInputs.forEach((inp) => {
							if (inp !== '' && el[access].toUpperCase().includes(inp.toUpperCase()))
								matchedData.push(el);
						})
					})
					break;
				case 'notContains':
					allData.forEach((el) => {
						arrOfInputs.forEach((inp) => {
							if (inp !== '' && !el[access].toUpperCase().includes(inp.toUpperCase()))
								matchedData.push(el);
						})
					})
					break;
				case 'startWith':
					allData.forEach((el) => {
						arrOfInputs.forEach((inp) => {
							if (inp !== '' && el[access].toUpperCase().startsWith(inp.toUpperCase()))
								matchedData.push(el);
						})
					})
					break;
				case 'endsWith':
					allData.forEach((el) => {
						arrOfInputs.forEach((inp) => {
							if (inp !== '' && el[access].toUpperCase().endsWith(inp.toUpperCase()))
								matchedData.push(el);
						})
					})
					break;
				case 'notEqual':
					allData.forEach((el) => {
						arrOfInputs.forEach((inp) => {
							if (inp !== '' && el[access].toUpperCase() !== (inp.toUpperCase()))
								matchedData.push(el);
						})
					})
					break;
				case 'equal':
					allData.forEach((el) => {
						arrOfInputs.forEach((inp) => {
							if (inp !== '' && el[access].toUpperCase() === (inp.toUpperCase()))
								matchedData.push(el);
						})
					})
					break;
				default:
					alert('You were trying to search How on earth did i get here')
			}
			setData(matchedData);
		}

	};

	function useControlledState(state, { instance }) {
		return React.useMemo(() => {
			if (state.groupBy.length) {
				return {
					...state,
					hiddenColumns: [...state.hiddenColumns, ...state.groupBy].filter(
						(d, i, all) => all.indexOf(d) === i
					),
				}
			}
			return state
		}, [state])
	}

	// separating the headers of the table and the data into variables
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		totalColumnsWidth,
		toggleHideColumn,
		toggleGroupBy,
		resetResizing,
		setColumnOrder,
		allColumns,
		state: { groupBy},
	} = useTable(
		{
			columns,
			data,
			//disableSortBy: true,
			defaultColumn,
		},
		useColumnOrder,
		useBlockLayout,
		useResizeColumns,
		useGroupBy,
		useSortBy,
		useSticky,
		useExpanded,


		// Our custom plugin to add the expander column
		hooks => {
			hooks.useControlledState.push(useControlledState)
			hooks.visibleColumns.push((columns, { instance }) => {
				if (!instance.state.groupBy.length) {
					return columns
				}

				return [
					{
						id: 'expander', // Make sure it has an ID
						// Build our expander column
						Header: ({ allColumns, state: { groupBy } }) => {
							return groupBy.map(columnId => {
								const column = allColumns.find(d => d.id === columnId)

								return (
									<label {...column.getHeaderProps()}>
										{column.render('Header')}{' '}
									</label>
								)
							})
						},
						Cell: ({ row }) => {
							if (row.canExpand) {
								const groupedCell = row.allCells.find(d => d.isGrouped)

								return (
									<label
										{...row.getToggleRowExpandedProps({
											style: {
												// We can even use the row.depth property
												// and paddingLeft to indicate the depth
												// of the row
												paddingLeft: `${row.depth * 2}rem`,

											},
										})}
										style={{
											display: 'flex'
										}}
									>
										<svg style={{
											width: '1.5rem',
											height: '1.5rem',
											marginRight: '1rem',
											fill: '#39648f'
										}}>
											{row.isExpanded ? <use xlinkHref={`${icon}#icon-minus`} /> : <use xlinkHref={`${icon}#icon-add`} />}

										</svg>

										{groupedCell.render('Cell')}{' '}
                    					({row.subRows.length})
									</label>
								)
							}

							return null
						},
					},
					...columns,
				]
			})
		});

	let localSearchIds = [];
	allColumns.forEach((el) => {
		localSearchIds.push(el.id)
	})
	useEffect(() => {
		if (props.columnsToHide !== null) {
			props.columnsToHide.forEach((el) => {
				toggleHideColumn(el.id, el.val);
				let input = document.getElementById(el.id + 'search');
				if (input !== null)
					if (el.val) {
						input.style.display = 'none';
					} else {
						input.style.display = "";
					}
			});
		}
	}, [props.columnsToHide[props.columnsToHide.length - 1]]);// eslint-disable-line react-hooks/exhaustive-deps
	function rowRenderer({
		key, // Unique key within array of rows
		index, // Index of row within collection
		isScrolling, // The List is currently being scrolled
		isVisible, // This row is visible within the List (eg it is not an overscanned row)
		style, // Style object to be applied to row (to position it)
	}) {
		const row = rows[index];
		prepareRow(row);
		return (
			<tr key={key}{...row.getRowProps({ style })}
			>
				{row.cells.map((cell) => {
					return (
						<td
							onClick={displayData}
							{...cell.getCellProps({
								style: {
									fontFamily: 'sans-serif',
									position: 'relative',
									cursor: 'pointer',
									textAlign: 'center',
									fontSize: '1.2rem',
									fontWeight: '500',
									lineHeight: '3rem',
									borderRight: '1px solid #dee1e2',
									color: '#5e6971',
								},
								className: cell.column.className
							})}
						>
							{cell.render('Cell')}
						</td>
					);
				})}
			</tr>

		);
	}

	useEffect(() => {
		if (props.searchID !== null) {
			let field = document.getElementById(localSearchIds[props.searchID] + 'search');
			field.value = props.searchVal;
			searchColumn(localSearchIds[props.searchID]);
		}
	}, [props.searchVal]);// eslint-disable-line react-hooks/exhaustive-deps

	const dataFiltration = (data, id, col) => {
		let unique = [];
		let index = 0;

		if (id % 1 === 0) {
			columns.forEach((el, i) => {
				if (el.id === col) {
					index = i;
				}
			})
			// l te3li2 men hal function
			data.forEach((el) => {
				unique.push(el[columns[index].accessor]);
			})
			unique = [...new Set(unique)];
		}
		return unique;
	};
	const incrementId = () => {
		if (Id === 5)
			Id = -1;
		Id = Id + 1;
		return Id
	};
	const setSearchBoxSize = (code) => {
		let w = '150px';
		headerGroups[0].headers.forEach((el, i) => {
			if (el.id === code) {
				//geting the width of the header
				w = headerGroups[0].headers[i].getHeaderProps().style.width;
				//getting the searchBox to the correct size
				w = w.split('p');
				w[0] = w[0] - 2;
				w = w.join('p')
			}
		})
		return { width: w };
	}
	const dragDropStyle = (isDragging) => {
		if (isDragging) {
			return ({
				background: "white",
				zIndex: '10',
				width: '100%',
				height: '100%',
				cursor: 'wait',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				boxShadow: ' 0 4px 0 0 rgba(3, 3, 3, 0.089)',
			})
		}
	};
	const clear = (id) => {
		toggleGroupBy(id, false)
		let columnsOrder = allColumns.map(o => o.id);
		let currentIndex = columnsOrder.indexOf(id);
		let columnToReorder = columnsOrder[currentIndex];
		columnsOrder.splice(currentIndex, 1);
		let originalIndex;
		columns.forEach((el, i) => {
			if (el.id === id)
				originalIndex = i;
		})
		columnsOrder.splice(originalIndex, 0, columnToReorder);
		setColumnOrder(columnsOrder)
	}

	const [a, seta] = useState(false);
	const headerRef = React.useRef(null);

	const dropdownPositioning = () => {
		let index = 0;
		allColumns.forEach((col, i) => {
			let id = col.id
			if (id !== 'expander') {
				if (groupBy.includes(id)) {
					id = 'expander'
				}
				let table = document.getElementById('table');
				let tRect = table.getBoundingClientRect();

				let head = document.getElementById("column" + id);
				let drop = document.getElementById('dropDownContainer' + index);
				if (head !== null) {
					let rect = head.getBoundingClientRect();

					drop.style.top = [(rect.top + rect.height / 5) + 'px'];
					drop.style.left = [(rect.left + rect.width / 1.3) + 'px'];
					if (tRect.width < (rect.left + rect.width / 1.3))
						drop.style.display = 'none'
					else
						drop.style.display = 'block'
				} else {
					drop.style.display = 'none'
				}
				index++;
			}
		})
	}
	useEffect(() => {
	
		let table = document.getElementById('table');
		table.onscroll = () => {
			dropdownPositioning();
		}
		dropdownPositioning();
	});
	return (

		<div  id={'table'} className={classes.Table}>
			{/* <select onChange={dropDownHandler}>
				<option>select an option</option>
				<option value="1000">1,000</option>
				<option value="10000">10,000</option>
				<option value="50000">50,000</option>
				<option value="1000000">1,000,000</option>4
			</select>
			<button onClick={clear}>dcd</button> */}

			<table {...getTableProps()} className={classes.table}>
				<thead>


					{headerGroups.map((headerGroup) => (
						<DragDropContext
							key={0}
							onDragStart={() => {

								currentColOrder.current = allColumns.map(o => o.id);
							}}

							onDragUpdate={(dragUpdateObj, b) => {
								// console.log("onDragUpdate", dragUpdateObj, b);

								const colOrder = [...currentColOrder.current];
								const sIndex = dragUpdateObj.source.index;
								const dIndex =
									dragUpdateObj.destination && dragUpdateObj.destination.index;

								if (typeof sIndex === "number" && typeof dIndex === "number") {
									colOrder.splice(sIndex, 1);
									colOrder.splice(dIndex, 0, dragUpdateObj.draggableId);
									setColumnOrder(colOrder);
								}
							}}
						>
							<Droppable droppableId="droppable" direction="horizontal">

								{(droppableProvided, snapshot) => (
									<tr {...headerGroup.getHeaderGroupProps()}
										ref={droppableProvided.innerRef}
									>

										{headerGroup.headers.map((column, index) => (
											//the headers
											<Draggable
												key={column.id}
												draggableId={column.id}
												index={index}
												isDragDisabled={!column.accessor || a}
											>

												{(provided, snapshot) => {
													const colId = column.id.replace(/ /g, "_");
													return (

														<th
															id={'column' + column.id}
															{...column.getHeaderProps(column.getSortByToggleProps())}
															className={classes.table__menu__item}
															data-col-id={colId}
														>
															<div

																{...provided.draggableProps}
																{...provided.dragHandleProps}
																ref={provided.innerRef}
															>

																<div className={classes.table__header}
																>
																	<div
																		ref={headerRef}
																		style={{
																			width: 'max-content',
																			...dragDropStyle(
																				snapshot.isDragging,
																			),
																		}}>

																		{column.render('Header')}
																	</div>
																	<div
																		{...column.getResizerProps()}
																		className={classes.resizer}
																		onMouseEnter={() => { seta(true) }}
																		onMouseLeave={() => { seta(false) }}
																	/>
																</div>
															</div>
														</th>
													);
												}}

											</Draggable>
										))}
									</tr>
								)}

							</Droppable>
						</DragDropContext>
					))}
				</thead>
				{
					allColumns.map(column => {
						if (column.id !=='expander')
						return <DropDown
							key={Id}
							width={headerRef && headerRef.current ? headerRef.current.clientWidth : 120}
							length={column.length}
							ID={incrementId()}
							columns={columns[Id]}
							allColumns={columns}
							data={dataFiltration(data, Id, column.id)}
							hiddenCol={props.columnsToHide}
							resetsizing={resetResizing}
							groupBy={() => toggleGroupBy(column.id)}
							localSearchIds={localSearchIds}
							searchColumn={searchColumn}
							dropdownPositioning={dropdownPositioning}
							reset={clear}
							/>
						else
							return null
					}
					)
				
				}
				<tbody {...getTableBodyProps()}>
					<tr className={classes.Search__row}>
						{localSearchIds.map((element) => (
							<th key={element}>
								<input
									data-col-id={`${element.replace(/ /g, "_")}__input`}
									type="text"
									id={element + 'search'}
									className={classes.table__searchInput}
									style={setSearchBoxSize(element)}
									onChange={() => {
										searchColumn(element);
									}}
								/>
							</th>
						))}
					</tr>
					<List
						width={totalColumnsWidth}
						height={420}
						rowCount={rows.length}
						rowHeight={30}
						rowRenderer={rowRenderer}
						className={classes.List}
					/>,
				</tbody>
			</table>
		</div>
	);
};
const mapStateToProps = (state) => {
	return {
		isDisplayed: state.form.isDisplayed,
		searchVal: state.dropDownSearch.data,
		searchID: state.dropDownSearch.id,
		columnsToHide: state.columnsSelect.columns,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		// expecting to get client data as an object
		onExtractClient: (clientData) =>
			dispatch(actions.extractClient(clientData)),

		// expected to get a boolean value
		onFormDisplay: (isDisplayed) => dispatch(actions.displayForm(isDisplayed)),

		// testing
		onCLientInit: (num) => dispatch(actions.fetchClients(num)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ReactTable);

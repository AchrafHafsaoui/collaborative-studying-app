import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Appbar } from 'react-native-paper';
import axios from 'axios';
import { io } from "socket.io-client";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pathsRoute, bubblesRoute, lockRoute, server } from '../../utils/apiRoutes';
import Slider from '@react-native-community/slider';
import { ScrollView } from 'react-native';
import { Image } from 'react-native-elements';


const WhiteboardScreen = ({ route }) => {
    var whiteboardId = route.params.identifier;
    const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
    const [expanded, setExpanded] = useState(false);
    const scrollViewHorizontalRef = useRef();
    const scrollViewVerticalRef = useRef();
    const navigation = useNavigation();
    const toolButtons = Array.from({ length: 5 }, (_, index) => ({ key: String(index) }));
    const colorButtons = Array.from({ length: 9 }, (_, index) => ({ key: String(index) }));
    const [binImage, setBinImage] = useState("delete");
    const [bubblesVisible, setBubblesVisible] = useState(true);
    const [bubbles, setBubbles] = useState([]);
    const [toolFunction, setToolFunction] = useState("1000"); //each bit represents one of the five tools
    const [paths, setPaths] = useState([]);
    const [stroke, setStroke] = useState(3);
    const [shape, setShape] = useState("010"); //each bit represents a shape (100 line/ 010 square/ 001 circle)
    const [color, setColor] = useState("rgb(0,0,0)");
    const [opacity, setOpacity] = useState(1);
    const [isSliderActive, setIsSliderActive] = useState(false);
    const socket = io(server);
    const [lock, setLock] = useState(true);

    const images = [
        <MaterialCommunityIcons name="gesture-tap" size={35} color="black" />,
        <MaterialCommunityIcons name="pen" size={35} color="black" />,
        <MaterialCommunityIcons name="eraser" size={35} color="black" />,
        toolFunction !== "0001" ? <MaterialCommunityIcons
            name="shape"
            size={35}
            color="black"
        /> : (
            <MaterialCommunityIcons
                name={shape === "100" ? "minus" : shape === "001" ? "square" : "circle"}
                size={35}
                color="black"
            />
        ),
        <MaterialCommunityIcons name="marker" size={35} color="black" />,
    ];

    const colors = [
        "rgb(0, 0, 0)",
        "rgb(255, 60, 60)",
        "rgb(255, 128, 0)",
        "rgb(255, 153, 153)",
        "rgb(153, 204, 255)",
        "rgb(51, 153, 255)",
        "rgb(178, 102, 255)",
        "rgb(0, 158, 21)",
        "rgb(98, 235, 116)",
    ];


    const pullPaths = () => {
        axios.post(pathsRoute, {
            "identifier": whiteboardId
        })
            .then((response) => {
                setPaths(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const pullLock = () => {
        axios.post(lockRoute, {
            "identifier": whiteboardId
        })
            .then((response) => {
                setLock(response.data.lock);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const pullBubbles = () => {
        axios.post(bubblesRoute, {
            "identifier": whiteboardId
        })
            .then((response) => {
                const bubblesArray = new Array(response.data.length);
                const locationsArray = new Array(response.data.length);
                const binX = Dimensions.get('screen').width * 19 / 20 + 15;
                const binY = Dimensions.get('screen').height / 4 - 65;
                response.data.forEach((bubbleData, index) => {
                    const locationX = bubbleData.locationX;
                    const locationY = bubbleData.locationY;
                    const pan = new Animated.ValueXY();

                    const panResponder = PanResponder.create({
                        onStartShouldSetPanResponder: () => true,
                        onPanResponderGrant: (event, gestureState) => {
                            // Update the the offset to drag the bubble from this point next time
                            pan.setOffset({ x: gestureState.x0 - locationsArray[index].x, y: gestureState.y0 - locationsArray[index].y });
                        },
                        onPanResponderMove: (event, gestureState) => {
                            pan.setValue({ x: gestureState.dx, y: gestureState.dy });
                            const distanceToBin = Math.sqrt(Math.pow(locationX + pan.x._value + pan.x._offset - binX, 2) + Math.pow(locationY + pan.y._value + pan.y._offset - binY, 2));
                            if (distanceToBin < 30) setBinImage("delete-outline");
                            else setBinImage("delete");
                        },
                        onPanResponderRelease: () => {
                            const distanceToBin = Math.sqrt(Math.pow(locationX + pan.x._value + pan.x._offset - binX, 2) + Math.pow(locationY + pan.y._value + pan.y._offset - binY, 2));
                            if (distanceToBin < 30) {
                                setBubbles(prevBubbles => {
                                    const updatedBubbles = [...prevBubbles];
                                    updatedBubbles[index] = null;
                                    return updatedBubbles;
                                });
                                deleteBubble(index);
                                setBinImage("delete");
                            }
                            else updateBubble(index, locationX + pan.x._value + pan.x._offset, locationY + pan.y._value + pan.y._offset);
                        },
                    });
                    locationsArray[index] = { x: locationX, y: locationY };
                    bubblesArray[index] = (
                        <Animated.View
                            key={index}
                            style={[
                                styles.bubble,
                                {
                                    backgroundColor: route?.params?.bubble === index ? 'rgba(255, 0, 0, 0.5)' : 'rgba(76, 175, 80, 0.5)',
                                    left: locationX - 15,
                                    top: locationY - 15,
                                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                                }
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <Text style={{ fontWeight: 'bold' }}>{index}</Text>
                        </Animated.View>
                    );
                });
                setBubbles(bubblesArray);
                if (scrollViewHorizontalRef.current && route?.params?.bubble && locationsArray[route?.params?.bubble].x > Dimensions.get('screen').width / 2) {
                    scrollViewHorizontalRef.current.scrollTo({ x: locationsArray[route.params.bubble].x - Dimensions.get('screen').width / 2, y: 0, animated: false });
                }
                if (scrollViewVerticalRef.current && route?.params?.bubble && locationsArray[route?.params?.bubble].y > Dimensions.get('screen').height / 2) {
                    scrollViewVerticalRef.current.scrollTo({ x: 0, y: locationsArray[route.params.bubble].y - Dimensions.get('screen').height / 2, animated: false });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    //Pull paths and bubbles
    useEffect(() => {
        pullPaths();
        pullBubbles();
        pullLock();
    }, []);


    //handle server updates
    useEffect(() => {
        const handleNewPath = (newPath) => {
            try {
                setPaths((prevPaths) => [...prevPaths, newPath]);
            } catch (e) {
                console.log(e.message);
            }
        };

        const handleDeletedPath = (deletedPath) => {
            try {
                setPaths((prevPaths) =>
                    prevPaths.filter((path) => path.path !== deletedPath.path)
                );
            } catch (e) {
                console.log(e.message);
            }
        };

        const handleBubble = () => {
            try {
                pullBubbles();
            } catch (e) {
                console.log(e.message);
            }
        };

        const handleToggleLock = () => {
            try {
                pullLock()
            } catch (e) {
                console.log(e.message);
            }
        };

        socket.on('newPath', handleNewPath);
        socket.on('pathDeleted', handleDeletedPath);
        socket.on('newBubble', handleBubble);
        socket.on('bubbleDeleted', handleBubble);
        socket.on('bubbleUpdated', handleBubble);
        socket.on('lockToggled', handleToggleLock);

        return () => {
            socket.off('newPath', handleNewPath);
            socket.off('pathDeleted', handleDeletedPath);
            socket.off('newBubble', handleBubble);
            socket.off('bubbleDeleted', handleBubble);
            socket.off('bubbleUpdated', handleBubble);
            socket.off('lockToggled', set);
        };
    }, []);

    const sendPath = (newPath) => {
        socket.emit('sendPath', { identifier: whiteboardId, path: newPath.path, color: newPath.color, strokeWidth: newPath.strokeWidth, opacity: newPath.opacity });
    };

    const toggleLock = () => {
        socket.emit('toggleLock', { identifier: whiteboardId });
    };

    const deletePath = (deletedPath) => {
        socket.emit('deletePath', { identifier: whiteboardId, path: deletedPath.path, color: deletedPath.color, strokeWidth: deletedPath.strokeWidth, opacity: deletedPath.opacity });
    };

    const sendBubble = (index, locationX, locationY) => {
        socket.emit('sendBubble', { identifier: whiteboardId, index: index, locationX: locationX, locationY: locationY });
    };

    const deleteBubble = (index) => {
        socket.emit('deleteBubble', { identifier: whiteboardId, index: index });
    };

    const updateBubble = (index, locationX, locationY) => {
        socket.emit('updateBubble', { identifier: whiteboardId, index: index, locationX: locationX, locationY: locationY });
    };



    const toggleBubblesVisibility = () => {
        setBubblesVisible(!bubblesVisible);
    };

    const configureColor = (color) => {
        setExpanded(false);
        setColor(color);
    }

    const configureTool = (index) => {
        setOpacity(1);
        if (index === 0) setToolFunction("1000");
        else if (index === 1) setToolFunction("0100");
        else if (index === 2) setToolFunction("0010");
        else if (index === 3) {
            setToolFunction("0001");
            const chars = shape.split('');
            const rotated = chars.slice(1).concat(chars[0]);
            setShape(rotated.join(''));
        }
        else {
            setOpacity(0.4);
        }
    }

    const handleToolStart = (event) => {
        if (!lock) {
            var { pageX, pageY } = event.nativeEvent.touches[0];
            pageX += scrollPosition[0];
            pageY += scrollPosition[1];
            if (toolFunction === "0100") {
                const newLine = { path: `M${pageX},${pageY}`, color: color, strokeWidth: stroke, opacity: opacity };
                setPaths(prevPaths => [...prevPaths, newLine]);
            }
            else if (toolFunction === "0010") {
                let closestDistance = Infinity;
                let closestIndex = -1;

                paths.forEach((line, index) => {
                    const lastPoint = line.path.split(' ').pop().split(',');
                    const pathX = parseFloat(lastPoint[0].substring(1));
                    const pathY = parseFloat(lastPoint[1]);

                    const distance = Math.sqrt(Math.pow(pageX - pathX, 2) + Math.pow(pageY - pathY, 2));

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                });

                if (closestIndex !== -1) {
                    deletePath(paths[closestIndex]);
                    setPaths(prevPaths => {
                        return prevPaths.filter((_, index) => index !== closestIndex);
                    });
                }
            }
            else if (toolFunction === "0001") {
                const newLine = { path: `M${pageX},${pageY}`, color: color, strokeWidth: stroke, opacity: opacity };
                setPaths(prevPaths => [...prevPaths, newLine]);
            }
        }
    };

    const handleToolMove = (event) => {
        if (!lock) {
            var { pageX, pageY } = event.nativeEvent.touches[0];
            pageX += scrollPosition[0];
            pageY += scrollPosition[1];
            if (toolFunction === "0100") {
                const updatedPath = `L${pageX},${pageY}`;
                setPaths(prevPaths => {
                    const lastPath = prevPaths[prevPaths.length - 1];
                    lastPath.path += updatedPath;
                    return [...prevPaths.slice(0, -1), lastPath];
                });
            } else if (toolFunction === "0001") {
                const startIndex = paths[paths.length - 1].path.indexOf('M') + 1;
                const commaIndex = paths[paths.length - 1].path.indexOf(',');
                const startX = parseFloat(paths[paths.length - 1].path.substring(startIndex, commaIndex));
                const startY = parseFloat(paths[paths.length - 1].path.substring(commaIndex + 1));
                //Draw line
                if (shape === "100") {
                    const newLinePath = `M${startX},${startY}L${pageX},${pageY}`;
                    setPaths(prevPaths => [...prevPaths.slice(0, -1), { path: newLinePath, color: color, strokeWidth: stroke, opacity: opacity }]);
                }
                //Draw square
                else if (shape === "001") {
                    const width = pageX - startX;
                    const height = pageY - startY;
                    const newRectPath = `M${startX},${startY}h${width}v${height}h${-width}Z`;
                    setPaths(prevPaths => [...prevPaths.slice(0, -1), { path: newRectPath, color: color, strokeWidth: stroke, opacity: opacity }]);
                } else {
                    const diameter = Math.sqrt(Math.pow(pageX - startX, 2) + Math.pow(pageY - startY, 2));
                    const radius = pageX >= startX ? diameter / 2 : -diameter / 2;
                    const newCirclePath = `M${startX},${startY}A${radius},${radius} 0 1,0 ${pageX},${pageY}A${radius},${radius} 0 1,0 ${startX},${startY}`;
                    setPaths(prevPaths => [...prevPaths.slice(0, -1), { path: newCirclePath, color: color, strokeWidth: stroke, opacity: opacity }]);
                }
            }
        }
    };

    const handleToolEnd = (event) => {
        if (!lock) {
            if (event && event.nativeEvent && event.nativeEvent.touches && event.nativeEvent.touches.length > 0) {
                var { pageX, pageY } = event.nativeEvent.touches[0];
                pageX += scrollPosition[0];
                pageY += scrollPosition[1];
                if (toolFunction === "0100") {
                    const updatedPath = `L${pageX + stroke},${pageY}`;

                    setPaths(prevPaths => {
                        const lastPath = prevPaths[prevPaths.length - 1];
                        lastPath.path += updatedPath;
                        return [...prevPaths.slice(0, -1), lastPath];
                    });
                }
            }
            if (toolFunction === "0100" || toolFunction === "0001") {
                sendPath({ path: paths[paths.length - 1].path, color: color, strokeWidth: stroke, opacity: opacity });
            }
        }
    };

    const onSliderValueChange = (value) => {
        setStroke(value);
        setIsSliderActive(true);
        setTimeout(() => {
            onSliderValueEnd(value); // Trigger the function after the delay
        }, 500);
    };

    const onSliderValueEnd = () => {
        setIsSliderActive(false);
    };

    const isScrollEnabled = () => {
        return toolFunction === '1000';
    };

    const [textVisible, setTextVisible] = useState(false);
    const [scrollPosition, setScrollPosition] = useState([0, 0]);

    const handleScroll = (event) => {
        const positionX = event.nativeEvent.contentOffset.x;
        const positionY = event.nativeEvent.contentOffset.y;
        setScrollPosition([positionX, positionY]);
    };

    const navigateToPersonalInformation = () => {
        navigation.navigate("PersonalInformation", route.params);
    };

    const navigateToSettings = () => {
        navigation.navigate("Settings", route.params);
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Whiteboard" />
                <Appbar.Action icon="cog" onPress={navigateToSettings} />
                <TouchableOpacity
                    style={{ backgroundColor: 'white', width: 30, height: 30, borderRadius: 15 }}
                    onPress={navigateToPersonalInformation}
                >
                    {userImage === "" ? (
                        <Image source={require('../../assets/user.png')} style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }} />
                    ) : (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${userImage}` }}
                            style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }}
                        />
                    )}
                </TouchableOpacity>
            </Appbar.Header>
            {isSliderActive && (
                <Text style={[styles.sliderValueText, { fontWeight: 'bold' }]}>Size: {stroke}</Text>
            )}
            <ScrollView
                onScroll={handleScroll}
                horizontal={true}
                style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width, position: 'absolute', zIndex: -1 }}
                scrollEnabled={isScrollEnabled()}
                ref={scrollViewHorizontalRef}
            >
                <ScrollView
                    onScroll={handleScroll}
                    style={{ height: Dimensions.get('screen').height, width: 2000, zIndex: -1 }}
                    scrollEnabled={isScrollEnabled()}
                    ref={scrollViewVerticalRef}
                >
                    <TouchableOpacity
                        style={styles.canva}
                        onLongPress={(event) => {
                            if (toolFunction === "1000") {
                                sendBubble(bubbles.length, event.nativeEvent.locationX, event.nativeEvent.locationY);
                                navigation.navigate("Groupchat", { ...route.params, bubble: bubbles.length });
                            }
                        }}
                        activeOpacity={1}
                    >
                        <Svg
                            style={{ height: '100%', width: '100%' }}
                            onTouchStart={handleToolStart}
                            onTouchMove={handleToolMove}
                            onTouchEnd={handleToolEnd}
                        >
                            {paths.map((line, index) => (
                                <Path
                                    key={index}
                                    d={line.path}
                                    stroke={line.color}
                                    strokeWidth={line.strokeWidth}
                                    fill="none"
                                    opacity={line.opacity}
                                />
                            ))}

                        </Svg>
                        {bubblesVisible && bubbles.map((button) => button)}
                    </TouchableOpacity>
                </ScrollView>
            </ScrollView>
            <View style={styles.hiddenToolsContainer}>
                <TouchableOpacity
                    style={[styles.toolButton]}
                    onPress={toggleBubblesVisibility}
                >
                    {bubblesVisible ?
                        <MaterialCommunityIcons name="eye-off" size={40} color="black" />
                        : <MaterialCommunityIcons name="eye" size={40} color="black" />
                    }
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toolButton]}
                >
                    <MaterialCommunityIcons name={binImage} size={40} color="black" />
                </TouchableOpacity>
                {route.params.isAdmin &&
                    <TouchableOpacity
                        style={[styles.toolButton]}
                        onPress={toggleLock}
                    >
                        {lock ?
                            <MaterialCommunityIcons name="lock" size={40} color="black" />
                            : <MaterialCommunityIcons name="lock-open-variant" size={40} color="black" />
                        }
                    </TouchableOpacity>}
            </View>
            <View style={styles.toolsContainer}>
                {toolButtons.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.toolButton, { backgroundColor: 'white', borderColor: toolFunction.charAt(index) === '1' || (opacity === 0.4 && index === 4) ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.3)', borderWidth: 1, }]}
                        onPress={() => configureTool(index)}
                        onLongPress={() => { if (index === 2) setPaths([]) }}
                    >
                        {images[index]}
                    </TouchableOpacity>
                ))}
            </View>


            {expanded && <View style={styles.expandedColorPanel}>
                <View style={{ transform: [{ rotate: "-90deg" }], height: 100, justifyContent: 'center' }}>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={30}
                        step={1}
                        value={stroke}
                        onValueChange={onSliderValueChange}
                    />
                </View>
                <View style={styles.colorsContainer}>
                    {colorButtons.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.colorButton, { backgroundColor: colors[index] }]}
                            onPress={() => configureColor(colors[index])}
                        />
                    ))}
                </View>

            </View>}
            {!expanded && <View style={styles.minimizedColorPanel}>
                <View style={{ transform: [{ rotate: "-90deg" }], height: 100, justifyContent: 'center' }}>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={30}
                        step={1}
                        value={stroke}
                        onValueChange={onSliderValueChange}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.colorButton, { backgroundColor: color }]}
                    onPress={() => setExpanded(true)}
                >
                </TouchableOpacity>
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    canva: {
        width: 2000,
        height: 2000,
        left: '0%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: -1,
    },
    hiddenToolsContainer: {
        flexDirection: 'column',
        height: 47 * 3,
        width: 48,
        borderRadius: 200,
        alignSelf: 'flex-end',
        marginBottom: 20
    },
    toolsContainer: {
        flexDirection: 'column',
        height: 47 * 5,
        width: 48,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 200,
        alignSelf: 'flex-end',
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowRadius: 5,
    },
    colorsContainer: {
        flexDirection: 'column',
    },
    bubble: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    toolButton: {
        width: 40,
        aspectRatio: 1,
        borderRadius: 200,
        marginTop: 3,
        marginBottom: 3,
        marginLeft: 3,
        marginRight: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedColorPanel: {
        height: 43 * 11.5,
        width: 48,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 200,
        marginTop: Dimensions.get('screen').height - 43 * 12.5,
        alignSelf: 'flex-start',
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowRadius: 5,
        position: 'absolute',
    },
    minimizedColorPanel: {
        height: 43 * 3.5,
        width: 48,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 200,
        marginTop: Dimensions.get('screen').height - 43 * 4.5,
        alignSelf: 'flex-start',
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowRadius: 5,
        position: 'absolute',
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 200,
        marginTop: 3,
        marginBottom: 0,
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1,
    },
    slider: {
        width: 100,
    },
    sliderValueText: {
        fontSize: 18,
        marginTop: Dimensions.get('screen').height * 10 / 100,
        position: 'absolute',
        alignSelf: 'center'
    },
});

export default WhiteboardScreen;
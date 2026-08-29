import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableNativeFeedback, Dimensions, TouchableOpacity, StyleSheet, InteractionManager } from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import GradeNumber from './GradeNumber';
import { convertDate } from '../../utils/ConvertDate';
import axios from 'axios';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { showToast } from '../custom-toast/ToastRef';
import AlertBottomDrawerHelper from '../alert-bottom-drawer/AlertBottomDrawerHelper';
import { vibrate } from '../../utils/vibrationManager';

const { width } = Dimensions.get('window');

function CommentRating({ _id, name, grade, date, comment, likeNumbers = 0, disLikeNumbers = 0, likedIt = false, disLikedIt = false }) {
    const colors = useAppTheme();
    const [likeNumber, setLikeNumber] = useState(likeNumbers);
    const [disLikeNumber, setDisLikeNumber] = useState(disLikeNumbers);
    const [liked, setLiked] = useState(likedIt);
    const [disLiked, setDisLiked] = useState(disLikedIt);

    // همگام‌سازی استیت در صورت تغییر پراپ‌ها از سمت والد
    useEffect(() => { setLikeNumber(likeNumbers); }, [likeNumbers]);
    useEffect(() => { setDisLikeNumber(disLikeNumbers); }, [disLikeNumbers]);
    useEffect(() => { setLiked(likedIt); }, [likedIt]);
    useEffect(() => { setDisLiked(disLikedIt); }, [disLikedIt]);

    const handleLike = useCallback(() => {
        vibrate();
        if (!liked) {
            // Optimistic UI Update
            setLiked(true);
            setLikeNumber(p => p + 1);
            if (disLiked) {
                setDisLiked(false);
                setDisLikeNumber(p => p - 1);
            }
            
            // جلوگیری از فریز شدن انیمیشن دکمه
            InteractionManager.runAfterInteractions(() => {
                operationLike();
            });
        }
    }, [liked, disLiked, _id]);

    const operationLike = async () => {
        try {
            const response = await axios.post('/', {
                query: `mutation setLikeRatingPackageGameByUser($rating: ID!){
                            setLikeRatingPackageGameByUser(rating: $rating) { status, message }
                        }`,
                variables: { rating: _id }
            });
            if (response.data?.data?.setLikeRatingPackageGameByUser?.status !== 200) {
                revertLike();
            }
        } catch {
            revertLike();
        }
    };

    const revertLike = () => {
        setLiked(false);
        setLikeNumber(p => p - 1);
    };

    const handleDislike = useCallback(() => {
        vibrate();
        if (!disLiked) {
            setDisLiked(true);
            setDisLikeNumber(p => p + 1);
            if (liked) {
                setLiked(false);
                setLikeNumber(p => p - 1);
            }
            InteractionManager.runAfterInteractions(() => {
                operationDisLike();
            });
        }
    }, [disLiked, liked, _id]);

    const operationDisLike = async () => {
        try {
            const response = await axios.post('/', {
                query: `mutation setDisLikeRatingPackageGameByUser($rating: ID!){
                            setDisLikeRatingPackageGameByUser(rating: $rating) { status, message }
                        }`,
                variables: { rating: _id }
            });
            if (response.data?.data?.setDisLikeRatingPackageGameByUser?.status !== 200) {
                revertDislike();
            }
        } catch {
            revertDislike();
        }
    };

    const revertDislike = () => {
        setDisLiked(false);
        setDisLikeNumber(p => p - 1);
    };

    const reportModal = useCallback(() => {
        const msg = [{
            text: "آیا محتوای این نظر نسبت به بستهٔ بازی، نامناسب است؟",
            style: { maxWidth: width - 30, fontFamily: Font.bakh_semi_bold, fontSize: 14, color: colors.text.a2, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 24 },
        }];
        
        AlertBottomDrawerHelper.showAlert({
            title: "ثبت گزارش بازخورد نامناسب",
            message: msg,
            buttons: [
                { onPress: reportRating, text: "ثبت گزارش", loading: true, stayOpen: true, type: "bold" },
                { onPress: () => {}, text: 'لغو', loading: false, stayOpen: false, type: "border" },
            ],
            options: {
                cancelable: true,
                icon: {
                    Icon: () => <Icon name="report" type="MaterialIcons" style={{ fontSize: 100, color: colors.alert.a1 }} />
                }
            }
        });
    }, [colors]);

    const reportRating = async () => {
        try {
            const response = await axios.post('/', {
                query: `mutation setReportCommentRatingPackageGameByUser($rating: ID!){
                            setReportCommentRatingPackageGameByUser(rating: $rating) { status, message }
                        }`,
                variables: { rating: _id }
            });
            
            AlertBottomDrawerHelper.hideAlert();
            const isSuccess = response.data?.data?.setReportCommentRatingPackageGameByUser?.status === 200;
            
            showToast({
                title: isSuccess ? "ثبت گزارش" : "مشکلی پیش آمد",
                message: isSuccess ? "از ثبت گزارش شما سپاس‌گزاریم." : "مشکلی در ثبت گزارش پیش آمد. لطفاً دوباره تلاش کنید.",
                type: isSuccess ? "success" : "error",
                animationType: "slide",
                position: "top",
            });
        } catch {
            AlertBottomDrawerHelper.hideAlert();
            showToast({
                title: "مشکلی پیش آمد",
                message: "مشکلی در ثبت گزارش پیش آمد. لطفاً دوباره تلاش کنید.",
                type: "error",
                animationType: "slide",
                position: "top",
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.userInfo}>
                    <Icon name="person" type="Ionicons" style={[styles.userIcon, { color: colors.text.a6 }]} />
                    <View style={styles.nameGradeContainer}>
                        <Text style={[styles.userName, { color: colors.text.a5 }]}>{name ? name : `کاربر حرف حساب`}</Text>
                        <GradeNumber size={12} grade={grade} />
                    </View>
                </View>
                <View style={styles.dateActionRow}>
                    <Text style={[styles.dateText, { color: colors.text.a6 }]}>{convertDate(date)}</Text>
                    <TouchableNativeFeedback onPress={reportModal} background={TouchableNativeFeedback.Ripple(colors.border.a1, false)}>
                        <View pointerEvents="box-only" style={styles.menuIconContainer}>
                            <Icon name="dots-three-vertical" type="Entypo" style={[styles.menuIcon, { color: colors.text.a5 }]} />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
            
            <View style={styles.commentContainer}>
                <Text style={[styles.commentText, { color: colors.text.a5 }]}>{comment}</Text>
            </View>
            
            <View style={styles.actionsRow}>
                <View style={styles.actionItem}>
                    <TouchableOpacity onPress={handleLike} disabled={liked}>
                        <Icon name={liked ? 'like1' : 'like2'} type="AntDesign" style={{ fontSize: 25, color: liked ? colors.primary.a1 : colors.text.a4 }} />
                    </TouchableOpacity>
                    <Text style={[styles.actionText, { color: colors.text.a5 }]}>{likeNumber}</Text>
                </View>
                <View style={styles.actionItem}>
                    <TouchableOpacity onPress={handleDislike} disabled={disLiked}>
                        <Icon name={disLiked ? 'dislike1' : 'dislike2'} type="AntDesign" style={{ fontSize: 25, color: disLiked ? colors.alert.a1 : colors.text.a4 }} />
                    </TouchableOpacity>
                    <Text style={[styles.actionText, { color: colors.text.a5 }]}>{disLikeNumber}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: width, flexDirection: 'column', marginVertical: 30 },
    headerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' },
    userInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginStart: 15 },
    userIcon: { fontSize: 40 },
    nameGradeContainer: { flexDirection: 'column', alignItems: 'flex-start', marginStart: 5 },
    userName: { fontFamily: Font.bakh_semi_bold, fontSize: 12, lineHeight: 25 },
    dateActionRow: { flexDirection: 'row', alignItems: 'center', marginEnd: 2 },
    dateText: { fontFamily: Font.bakh_semi_bold, fontSize: 12, marginEnd: 10 },
    menuIconContainer: { justifyContent: 'center', alignItems: 'center', padding: 10 },
    menuIcon: { fontSize: 15 },
    commentContainer: { marginVertical: 15, paddingHorizontal: 15 },
    commentText: { fontFamily: Font.bakh_semi_bold, fontSize: 14, lineHeight: 23 },
    actionsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'flex-start', paddingHorizontal: 15, gap: 30 },
    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    actionText: { fontFamily: Font.black, fontSize: 11 }
});

const areEqual = (prevProps, nextProps) => {
    return (
        prevProps._id === nextProps._id &&
        prevProps.likeNumbers === nextProps.likeNumbers &&
        prevProps.disLikeNumbers === nextProps.disLikeNumbers &&
        prevProps.likedIt === nextProps.likedIt &&
        prevProps.disLikedIt === nextProps.disLikedIt &&
        prevProps.grade === nextProps.grade &&
        prevProps.comment === nextProps.comment
    );
};

export default React.memo(CommentRating, areEqual);
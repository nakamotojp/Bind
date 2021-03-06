// eslint-disable-next-line no-unused-vars
/* global google */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Card, CardActions, CardHeader, Divider, makeStyles, Fab, Typography } from '@material-ui/core';
import { EventAvailable, Send, CheckCircle, InsertPhoto } from '@material-ui/icons';
import { DropzoneDialog } from 'material-ui-dropzone';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import cuid from 'cuid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

// COMPONENT
import MytextInput from '../../../app/common/form/MytextInput';
import MySelectInput from '../../../app/common/form/MySelectInput';
import MyTextArea from '../../../app/common/form/MyTextArea';
import MyDateInput from '../../../app/common/form/MyDateInput';
import MyPlaceInput from '../../../app/common/form/MyPlaceInput';
import ButtonComponent from '../../../app/layout/ButtonComponent';
import { categoryData, memberData } from '../../../app/api/categoryOption';
import {
  addEventToFirestore,
  listenToEventFromFirestore,
  updateEventInFireStore,
  updateEventThumbImg,
} from '../../../app/firestore/firestoreService';
import { deleteStorageImage, uploadEventThumbImgStorage } from '../../../app/firestore/fireStorageService';
import { getFileExtension } from '../../../app/util/util';
import useFirestoreDoc from '../../../app/hooks/useFirestoreDoc';
import { clearModifyEvent, listenToModifyEvent } from '../eventActions';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '80%',
    margin: '0 auto',
    '& .MuiFormControl-root': {
      margin: theme.spacing(0, 0, 3, 0),
    },
  },
  card: {
    boxShadow: theme.shadows[7],
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

export default function EventForm({ match }) {
  const classes = useStyles();
  const { modifyEvent } = useSelector((state) => state.event);
  const { prevLocation } = useSelector((state) => state.auth);
  const [imageFile, setImageFile] = useState({ open: false, files: [] });
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const dispatch = useDispatch();

  useFirestoreDoc({
    shouldExcute: match.path !== '/createEvent',
    query: () => listenToEventFromFirestore(match.params.id),
    data: (event) => dispatch(listenToModifyEvent(event)),
    deps: [dispatch, match.params.id],
  });

  useEffect(() => {
    return () => dispatch(clearModifyEvent());
  }, [dispatch]);

  const initialValues = useMemo(
    () =>
      modifyEvent ?? {
        title: '',
        category: '',
        member: 1,
        description: '',
        city: { address: '', latLng: null },
        date: new Date(),
      },
    [modifyEvent]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string('??????????????? ????????? ?????? ????????? ?????? ???????????????.').required('????????? ?????? ????????? ?????????.'),
        category: Yup.string().required('??????????????? ?????? ????????? ?????????.'),
        member: Yup.number(),
        description: Yup.string().required('????????? ?????? ????????? ?????????.'),
        city: Yup.object().shape({
          address: Yup.string().required('????????? ?????? ????????? ?????????.'),
          latLng: Yup.object().required('????????? ????????? ??????????????????'),
        }),
        date: Yup.date(),
      }),
    []
  );

  const handleSaveImage = (file) => {
    setImageFile({ open: false, files: file });
  };

  const handleUploadEvent = useCallback(
    async (values, { setSubmitting }) => {
      try {
        const event = modifyEvent ? await updateEventInFireStore(values) : await addEventToFirestore(values);
        const isModifyed = modifyEvent ? modifyEvent : event;

        if (imageFile['files'].length > 0) {
          const filename = cuid() + '.' + getFileExtension(imageFile['files'][0]?.['name']);
          const uploadTask = uploadEventThumbImgStorage(isModifyed, imageFile['files'][0], filename);
          const unsubscribe = uploadTask.on('state_changed', null, null, (complete) => {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadURL) => {
                if (modifyEvent?.thumbnailURL) {
                  deleteStorageImage(isModifyed, modifyEvent.thumbnailName);
                }
                return downloadURL;
              })
              .then((downloadURL) => {
                return updateEventThumbImg(isModifyed, { thumbnailURL: downloadURL, thumbnailName: filename });
              })
              .then((_) => {
                setSubmitting(false);
                enqueueSnackbar(modifyEvent ? '???????????? ???????????? ???????????????.' : '???????????? ????????? ???????????????', {
                  variant: 'success',
                });
                unsubscribe();
                history.push(prevLocation);
              })
              .catch((error) => {
                enqueueSnackbar(error.message, { variant: 'error' });
              });
          });
          return;
        } else {
          setSubmitting(false);
          enqueueSnackbar(modifyEvent ? '???????????? ???????????? ???????????????.' : '???????????? ????????? ???????????????', {
            variant: 'success',
          });
          history.push(prevLocation);
        }
      } catch (error) {
        enqueueSnackbar(error.message, { variant: 'error' });
        setSubmitting(false);
      }
    },
    [enqueueSnackbar, history, imageFile, modifyEvent, prevLocation]
  );

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={
          <Avatar>
            <EventAvailable color='primary' />
          </Avatar>
        }
        title={modifyEvent ? '????????? ????????????' : '????????? ????????????'}
        className={classes.root}
      />
      <Divider light={true} variant='middle' />
      <CardActions>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleUploadEvent}
        >
          {({ dirty, isValid, isSubmitting }) => {
            return (
              <Form className={classes.root}>
                <MytextInput label='??????' name='title' autoComplete='off' />
                <Box display='flex' flexWrap='wrap'>
                  <MySelectInput label='????????????' name='category' option={categoryData} />
                  <MySelectInput label='??????' name='member' option={memberData} />
                </Box>

                <MyTextArea label='????????? ??????' name='description' />
                <MyPlaceInput label='??????' name='city' />
                <MyDateInput label='????????? ??????' name='date' />

                <Fab
                  variant='extended'
                  color='primary'
                  aria-label='add'
                  onClick={() => setImageFile({ open: true, files: [] })}
                >
                  {imageFile['files'].length > 0 ? (
                    <CheckCircle className={classes.margin} />
                  ) : (
                    <InsertPhoto className={classes.margin} />
                  )}
                  {imageFile['files'].length > 0 ? '????????? ??????' : '????????? ?????????'}
                </Fab>
                <Typography variant='caption' color='textSecondary' display='block' style={{ marginTop: 5 }}>
                  ???????????? ????????? ?????? ?????? ???????????? ???????????? ???????????? ???????????????.
                </Typography>
                <DropzoneDialog
                  open={imageFile.open}
                  onSave={handleSaveImage}
                  onClose={() => setImageFile({ open: false, files: [] })}
                  acceptedFiles={['image/jpeg', 'image/png', 'image/jpg']}
                  initialFiles={[]}
                  showPreviews={true}
                  maxFileSize={3000000}
                  filesLimit={1}
                  getFileAddedMessage={(fileName) => `????????? ${fileName}??? ?????????????????????.`}
                  getFileLimitExceedMessage={(filesLimit) =>
                    `????????? ??????(3MB)??? ?????????????????????. ${filesLimit}????????? ???????????????`
                  }
                  getFileRemovedMessage={(fileName) => `????????? ${fileName}??? ?????????????????????.`}
                />

                <Box display='flex' flexDirection='row-reverse'>
                  <ButtonComponent
                    startIcon={<Send />}
                    color='primary'
                    loading={isSubmitting}
                    disabled={!isValid || isSubmitting}
                    type='submit'
                    content={'??????'}
                    variant='contained'
                  />
                  <ButtonComponent
                    variant='contained'
                    loading={false}
                    content='??????'
                    onClick={() => history.push(prevLocation)}
                  />
                </Box>
              </Form>
            );
          }}
        </Formik>
      </CardActions>
    </Card>
  );
}
